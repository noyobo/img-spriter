var PNG = require('pngjs').PNG;
var fs = require('fs');

var debug = require('debug')('img-spriter:lib:png');

module.exports = {
  /**
   * 创建一个 png 图片
   * @param  {Number} width
   * @param  {Number} height
   * @return {PNG}
   */
  create: function(width, height) {
    var png = new PNG({
      width: width,
      height: height
    });
    for (var y = 0; y < png.height; y++) {
      for (var x = 0; x < png.width; x++) {
        var idx = (png.width * y + x) << 2;

        png.data[idx] = 0;
        png.data[idx + 1] = 0;
        png.data[idx + 2] = 0;
        png.data[idx + 3] = 0;
      }
    }
    return png;
  },
  /**
   * 读取单个图片的内容和信息
   * @param {String} filepath
   * @param {Function} callback callback(ImageInfo)
   * { // ImageInfo
   *     image: null, // 图片数据
   *     width: 0,
   *     height: 0,
   * }
   * @return {Promise} imageInfo
   */
  readInfo: function(filepath, margin) {
    return new Promise(function(resolve, reject) {
      fs.createReadStream(filepath).pipe(new PNG())
        .on('parsed', function() {
          var imageInfo = {
            image: this,
            width: this.width,
            height: this.height
          };
          debug('get image info success:', filepath)
          resolve(imageInfo);
        })
        .on('error', function(err) {
          debug(err);
          reject(e);
        });
    })
  }
};
