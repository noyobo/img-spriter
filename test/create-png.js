var png = require('../lib/png.js');
var co = require('co');
var image = require('./packer.js');
var path = require('path');
var fs = require('fs');

var originalCoordinate = {
  x: 10,
  y: 10
}

co(function*() {
  
  var sprite = yield png.create(image.root.w + originalCoordinate.x, image.root.h + originalCoordinate.y);

  var imageArr = image.arr.map(function(item) {
    item.imageUrl = path.join(__dirname, '../', item.imageUrl);
    return png
      .readInfo(item.imageUrl)
      .then((imageInfo) => {
        item.imageInfo = imageInfo;
        return item;
      });
  });

  imageArr = yield Promise
    .all(imageArr)
    .then(function(images) {
      return images;
    })

  imageArr.map(function(imageObj) {
    var imageInfo = imageObj.imageInfo;

    var image = imageInfo.image;
    try {
      image.bitblt(
        sprite, 0, 0,
        image.width,
        image.height,
        imageObj.fit.x + originalCoordinate.x,
        imageObj.fit.y + originalCoordinate.y
      );
    } catch (err) {
      console.log(err);
      throw err;
    }
    return imageObj;
  })

  var spriteOutput = path.join(__dirname, './sprite.png');

  sprite.pack()
    .pipe(fs.createWriteStream(spriteOutput))
    .on('finish', function() {
      console.log('>>Output image:', spriteOutput);
    });
  // console.log(imageArr);
})
