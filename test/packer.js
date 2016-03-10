var GrowingPacker = require('../lib/GrowingPacker.js');

var arr = require('../files/data.js');


var packer = new GrowingPacker();

arr.sort(function(a, b) {
  return b.w * b.h - a.w * a.h;
});

packer.fit(arr);

// var fs = require('fs');

// fs.writeFileSync('./packer-output.json', JSON.stringify(packer, null, 2));
// fs.writeFileSync('./packer-arr.json', JSON.stringify(arr, null, 2));



module.exports = {
  arr,
  root: packer.root
};
