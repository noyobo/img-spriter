var imgSpriter = require('../')
var path = require('path');
var data = require('../files/data.js');
var fs = require('fs');

// data.map(function(item) {
//   item.imageUrl = path.join(__dirname, '../', item.imageUrl);
//   return item;
// })

imgSpriter.processHTTP(data)
  .then(function(data) {
    imgSpriter.sprite(data, {
        margin: 5,
        png8:true
      })
      .then(function(data) {


        var spriteOutput8 = path.join(__dirname, './sprite-8.png');
        var spriteOutput = path.join(__dirname, './sprite.png');

        fs.writeFileSync(
          './test/index-output.json',
          JSON.stringify(data.dataSource, null, 2)
        );
        data.streamPNG8
          .pipe(fs.createWriteStream(spriteOutput8))
          .on('finish', function() {
            console.log('>>Output image:', spriteOutput8);
          });
        data.stream
          .pipe(fs.createWriteStream(spriteOutput))
          .on('finish', function() {
            console.log('>>Output image:', spriteOutput);
          });
      }).catch(function(err) {
        console.log('========', err);
      })
  }).catch(function(err) {
    console.log('========', err);
  })
