# img-spriter

[![Greenkeeper badge](https://badges.greenkeeper.io/noyobo/img-spriter.svg)](https://greenkeeper.io/)

image sprite generator

## API

#### process(imageFrames <Array>)

Processed image objects, increase information field `imageInfo`

- `imageFrames` - Image array
  - `imageUrl` required, local file absolute path *e.g: /User/home/a.png*
  
```js
// input 
[{
  imageUrl: '/Users/home/a.png'
}]
// output
[{
  imageUrl: '/Users/home/a.png',
  imageInfo: {
    image: Stream,
    width: Number,
    height: Number,
  }
}]
```

#### processHTTP(imageFrames <Array>)

Like the `process`, but `imageUrl` is a http link address


#### sprite(imageFrames <Array> [, options])

Image sprite generator

- `iamgeFrames` - Image array
- `options`
  - `margin` - **default: 5** Icon margin 
  
- `@return`

```js
{
  stream: Sprite image Stream,
  dataSource: icon coordinate information
}
```
  

## Example

```js
var data = [{
  imageUrl: 'http://img.alicdn.com/tps/i2/TB1fvaMLVXXXXbuXFXXEDhGGXXX-32-32.png',
  filename: 'acd',
  w: 32,
  h: 32
}, {
  imageUrl: 'http://img.alicdn.com/tps/i1/TB18_qELVXXXXaKXVXXEDhGGXXX-32-32.png',
  filename: 'ac12312',
  w: 32,
  h: 32
}, {
  imageUrl: 'http://img.alicdn.com/tps/i2/TB1sEiZLVXXXXXxXFXXEDhGGXXX-32-32.png',
  filename: 'ac12312',
  w: 32,
  h: 32
}]

imgSpriter.processHTTP(data)
  .then(function(data) {
    imgSpriter.sprite(data)
      .then(function(data) {
        var spriteOutput = path.join(__dirname, './sprite.png');

        fs.writeFileSync(
          './test/index-output.json',
          JSON.stringify(data.dataSource, null, 2)
        );
        data.stream.pack()
          .pipe(fs.createWriteStream(spriteOutput))
          .on('finish', function() {
            console.log('output image:', spriteOutput);
          });
      }).catch(function(err) {
        console.log(err);
      })
  }).catch(function(err) {
    console.log('========', err);
  })
```