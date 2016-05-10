'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

const debug = require('debug')('img-spriter');
const assert = require('assert');
const path = require('path');
const fs = require('fs');

const merge = require('object-merge');
const Pngquant = require('pngquant');
const GrowingPacker = require('./lib/GrowingPacker.js');
const png = require('./lib/png.js');

const defaultOptions = {
  margin: 5,
  png8: false,
  dpi: 1
};

function wrap(item, imageInfo) {
  item.imageInfo = imageInfo;

  item.sizeDiff = {
    w: [item.w !== imageInfo.width, item.w, imageInfo.width],
    h: [item.h !== imageInfo.height, item.h, imageInfo.height]
  };

  item.w = imageInfo.width;
  item.h = imageInfo.height;
  return item;
}

function getImageInfo(arr) {
  return Promise.all(arr.map(function (item, key) {
    if (!item.imageUrl) {
      throw new Error('imageUrl is required!');
    }
    return png.readInfo(item.imageUrl).then(imageInfo => {
      return wrap(item, imageInfo);
    });
  }));
}

function getImageInfoByHTTP(arr) {
  return Promise.all(arr.map(function (item, key) {
    if (!item.imageUrl) {
      throw new Error('imageUrl is required!');
    }
    return png.readInfoByHTTP(item.imageUrl).then(imageInfo => {
      return wrap(item, imageInfo);
    });
  }));
}

module.exports = {
  /**
   * 生成 sprite 图片
   * @param  {Array} arr 图片队列
   * @param {String} imageFrames.imageUrl 图片地址
   * @param {String} imageFrames.w 图片宽度
   * @param {String} imageFrames.h 图片高度
   * @param  {Object} options    参数
   * @return {Stream}
   */
  sprite: (() => {
    var ref = _asyncToGenerator(function* (imageFrames, options) {
      options = merge(defaultOptions, options || {});

      debug('options:', options);

      options.margin = options.margin * options.dpi;

      var packer = new GrowingPacker();
      // 排序图片
      // TODO: 支持更多排序算法
      imageFrames.sort(function (a, b) {
        return b.w * b.h - a.w * a.h;
      });

      // 图标的间隔
      imageFrames.map(function (a) {
        a.w = a.w + options.margin;
        a.h = a.h + options.margin;
        return a;
      });

      packer.fit(imageFrames);

      const outputPNG = png.create(packer.root.w, packer.root.h);

      imageFrames = imageFrames.map(function (imageObj) {
        var imageInfo = imageObj.imageInfo;
        var image = imageInfo.image;
        try {
          image.bitblt(outputPNG, 0, 0, image.width, image.height, imageObj.fit.x, imageObj.fit.y);
        } catch (err) {
          debug(err);
          throw err;
        }

        console.log(imageObj);

        var frame = {
          'frame': {
            'y': imageObj.fit.y * -1 / options.dpi,
            'x': imageObj.fit.x * -1 / options.dpi,
            'w': (imageObj.w - options.margin) / options.dpi,
            'h': (imageObj.h - options.margin) / options.dpi
          },
          'sourceSize': {
            'h': image.height,
            'w': image.width
          }
        };

        delete imageObj.imageInfo;
        delete imageObj.fit;
        delete imageObj.w;
        delete imageObj.h;
        Object.assign(frame, imageObj);
        return frame;
      });

      // Starts converting data to PNG file Stream.
      outputPNG.pack();

      const result = {
        stream: outputPNG,
        dataSource: {
          'frames': imageFrames,
          'meta': {
            'height': outputPNG.height / options.dpi,
            'width': outputPNG.width / options.dpi,
            'originWidth': outputPNG.width,
            'originHeight': outputPNG.height,
            'hash': Date.now().toString(32),
            'dpi': options.dpi
          },
          'options': options
        }
      };

      if (options.png8) {
        // png24 converter png8
        const outputPNG8 = png.create(packer.root.w, packer.root.h);

        outputPNG.bitblt(outputPNG8, 0, 0, packer.root.w, packer.root.h, 0, 0);

        outputPNG8.pack();

        result.streamPNG8 = outputPNG8.pipe(new Pngquant());
      }

      return result;
    });

    function spriter(_x, _x2) {
      return ref.apply(this, arguments);
    }

    return spriter;
  })(),
  process: (() => {
    var ref = _asyncToGenerator(function* (imageFrames) {
      if (!imageFrames || imageFrames.length === 0) {
        throw new Error('icorrect argument imageFrames!');
      }
      imageFrames = yield getImageInfo(imageFrames).catch(function (err) {
        debug(err);
        throw new Error(err);
      });
      return imageFrames;
    });

    function process(_x3) {
      return ref.apply(this, arguments);
    }

    return process;
  })(),
  processHTTP: (() => {
    var ref = _asyncToGenerator(function* (imageFrames) {
      if (!imageFrames || imageFrames.length === 0) {
        throw new Error('icorrect argument imageFrames!');
      }
      imageFrames = yield getImageInfoByHTTP(imageFrames).catch(function (err) {
        debug(err);
        throw new Error(err);
      });
      return imageFrames;
    });

    function processHTTP(_x4) {
      return ref.apply(this, arguments);
    }

    return processHTTP;
  })()
};
