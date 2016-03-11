var png = require('../lib/png.js');


png.readInfoByHTTP('http://img.alicdn.com/tps/i2/TB1fvaMLVXXXXbuXFXXEDhGGXXX-32-32.png')
  .then(function(imginfo) {
    console.log(imginfo);
  })
