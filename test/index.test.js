var imgSpriter = require('../')
var path = require('path');
var data = require('../files/data.js');
var fs = require('fs');

data.map(function(item) {
  item.imageUrl = path.join(__dirname, '../', item.imageUrl);
  return item;
})


imgSpriter(data, {
    margin: 5
  })
  .then(function(data) {

    var spriteOutput = path.join(__dirname, './sprite.png');
    fs.writeFileSync(
      './test/index-output.json',
      JSON.stringify(data.dataSource, null, 2)
    );
    data.stream.pack()
      .pipe(fs.createWriteStream(spriteOutput))
      .on('finish', function() {
        console.log('>>Output image:', spriteOutput);
      });
  }).catch(function(err) {
    console.log(err);
  })
