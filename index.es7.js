'use strict';
const debug = require('debug')('img-spriter');

const path = require('path');
const fs = require('fs');

const Pngquant = require('pngquant');
const GrowingPacker = require('./lib/GrowingPacker.js');
const png = require('./lib/png.js');

const defaultOptions = {
  margin: 5,
  png8: false
}

function wrap(item, imageInfo) {
  item.imageInfo = imageInfo;

  item.sizeDiff = {
    w: [item.w !== imageInfo.width, item.w, imageInfo.width],
    h: [item.h !== imageInfo.height, item.h, imageInfo.height]
  }

  item.w = imageInfo.width;
  item.h = imageInfo.height;
  return item;
}

function getImageInfo(arr) {
  return Promise.all(arr.map(function(item, key) {
    if (!item.imageUrl) {
      throw new Error('imageUrl is required!')
    }
    return png
      .readInfo(item.imageUrl)
      .then((imageInfo) => {
        return wrap(item, imageInfo);
      });
  }))
}

function getImageInfoByHTTP(arr) {
  return Promise.all(arr.map(function(item, key) {
    if (!item.imageUrl) {
      throw new Error('imageUrl is required!')
    }
    return png
      .readInfoByHTTP(item.imageUrl)
      .then((imageInfo) => {
        return wrap(item, imageInfo);
      });
  }))
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
  sprite: async function spriter(imageFrames, options) {
    options = Object.assign(defaultOptions, options || {});

    debug('options:', options);

    var packer = new GrowingPacker()
      // 排序图片
      // TODO: 支持更多排序算法
    imageFrames.sort(function(a, b) {
      return b.w * b.h - a.w * a.h;
    });

    // 图标的间隔
    imageFrames.map(function(a) {
      a.w = a.w + options.margin;
      a.h = a.h + options.margin;
      return a;
    })
    packer.fit(imageFrames);

    const outputPNG = png.create(
      packer.root.w,
      packer.root.h
    );

    imageFrames = imageFrames.map(function(imageObj) {
      var imageInfo = imageObj.imageInfo;
      var image = imageInfo.image;
      try {
        image.bitblt(
          outputPNG, 0, 0,
          image.width,
          image.height,
          imageObj.fit.x,
          imageObj.fit.y
        );
      } catch (err) {
        debug(err);
        throw err;
      }

      var frame = {
        'frame': {
          'y': imageObj.fit.y * -1,
          'x': imageObj.fit.x * -1,
          'w': imageObj.fit.w - options.margin,
          'h': imageObj.fit.h - options.margin
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
          'height': outputPNG.height,
          'width': outputPNG.width,
          'hash': Date.now().toString(32)
        }
      }
    }
    
    if (options.png8) {
      result.streamPNG8 = outputPNG.pipe(new Pngquant())
    }

    return result;
  },
  process: async function process(imageFrames) {
    if (!imageFrames || imageFrames.length === 0) {
      throw new Error('icorrect argument imageFrames!');
    }
    imageFrames = await getImageInfo(imageFrames)
      .catch(err => {
        debug(err);
        throw new Error(err);
      });
    return imageFrames;
  },
  processHTTP: async function processHTTP(imageFrames) {
    if (!imageFrames || imageFrames.length === 0) {
      throw new Error('icorrect argument imageFrames!');
    }
    imageFrames = await getImageInfoByHTTP(imageFrames)
      .catch(err => {
        debug(err);
        throw new Error(err);
      });
    return imageFrames;
  }
};
