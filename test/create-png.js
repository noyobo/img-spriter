var png = require('../lib/png.js');
var co = require('co');
var image = require('./packer.js');
var path = require('path');

// console.log(image);

co(function*() {
  var sprite = yield png.create(image.root.w, image.root.h);

  var imageArr = image.arr.map(function(item) {
    item.imageUrl = path.join(__dirname, '../', item.imageUrl);
    return png.readInfo(item.imageUrl).then((imageInfo) => {
      item.imageInfo = imageInfo;
      return item;
    });
    // return item;
  });

  // var processImage = imageArr.map(function(item) {
  //   item.imageUrl = path.join(__dirname, '../', item.imageUrl);
  //   item.imageInfo = yield png.readInfo(item.imageUrl);
  //   return item;
  // })

  yield Promise
    .all(imageArr)
    .then(function(images) {
      console.log(images[0]['imageInfo'].image);
    })
})
