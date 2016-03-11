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
 * @param {String} imageQueue.imageUrl 图片地址
 * @param {String} imageQueue.w 图片宽度
 * @param {String} imageQueue.h 图片高度
 * @param  {Object} options    参数
 * @return {Stream}
 */

module.exports = async function imgSpriter(imageQueue, options) {
  options = Object.assign(defaultOptions, options || {});
  debug('options:', options)
  imageQueue = await getImageInfo(imageQueue)
    .catch(err => {
      debug(err);
      throw err;
    });

  var packer = new GrowingPacker()
    // 排序图片
    // TODO: 支持更多排序算法
  imageQueue.sort(function(a, b) {
    return b.w * b.h - a.w * a.h;
  });
  
  // 图标的间隔
  imageQueue.map(function(a) {
    a.w = a.w + options.margin;
    a.h = a.h + options.margin;
    return a;
  })
  packer.fit(imageQueue);

  const outputPNG = png.create(
    packer.root.w,
    packer.root.h
  );

  imageQueue.map(function(imageObj) {
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
      delete imageObj.imageInfo;
    } catch (err) {
      debug(err);
      throw err;
    }
    return imageObj;
  })

  return {
    stream: outputPNG,
    imageQueue: imageQueue
  }
};
