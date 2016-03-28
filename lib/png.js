const PNG = require('pngjs').PNG;
const fs = require('fs');
const request = require('request');

const debug = require('debug')('img-spriter:lib:png');

module.exports = {
  /**
   * 创建一个 png 图片
   * @param  {Number} width
   * @param  {Number} height
   * @return {PNG}
   */
  create: function (width, height) {
    const png = new PNG({
      width: width,
      height: height,
    });
    for (let y = 0; y < png.height; y++) {
      for (let x = 0; x < png.width; x++) {
        const idx = (png.width * y + x) << 2;

        png.data[idx] = 0;
        png.data[idx + 1] = 0;
        png.data[idx + 2] = 0;
        png.data[idx + 3] = 0;
      }
    }
    return png;
  },
  readInfo: function (filepath) {
    return new Promise(function (resolve, reject) {
      fs.createReadStream(filepath).pipe(new PNG())
        .on('parsed', function () {
          const imageInfo = {
            image: this,
            width: this.width,
            height: this.height,
          };
          debug('get image info success:', filepath);
          resolve(imageInfo);
        })
        .on('error', function (err) {
          debug(err);
          reject(err);
        });
    });
  },
  readInfoByHTTP: function (imageurl) {
    return new Promise(function (resolve, reject) {
      request(imageurl)
        .pipe(new PNG())
        .on('parsed', function () {
          const imageInfo = {
            image: this,
            width: this.width,
            height: this.height,
          };
          debug('get image info success:', imageurl);
          resolve(imageInfo);
        })
        .on('error', function (err) {
          debug(err);
          reject(err);
        });
    });
  },
};
