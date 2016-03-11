'use strict';
const debug = require('debug')('img-spriter');

const path = require('path');
const fs = require('fs');
const GrowingPacker = require('./lib/GrowingPacker.js');
const png = require('./lib/png.js');

const defaultOptions = {
  margin: 0
}


function getImageInfo(arr) {
  return Promise.all(arr.map(function(item, key) {
    return png
      .readInfo(item.imageUrl)
      .then((imageInfo) => {
        item.imageInfo = imageInfo;
        return item;
      });
  }))
}

/**
 * 生成 sprite 图片
 * @param  {Array} arr 图片队列
 * @param {String} imageFrames.imageUrl 图片地址
 * @param {String} imageFrames.w 图片宽度
 * @param {String} imageFrames.h 图片高度
 * @param  {Object} options    参数
 * @return {Stream}
 */

module.exports = async function imgSpriter(imageFrames, options) {
  options = Object.assign(defaultOptions, options || {});
  debug('options:', options)
  imageFrames = await getImageInfo(imageFrames)
    .catch(err => {
      debug(err);
      throw err;
    });

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
    return frame
  })
  return {
    stream: outputPNG,
    dataSource: {
      'frames': imageFrames,
      'meta': {
        'height': outputPNG.height,
        'width': outputPNG.width,
      }
    }
  }
};
