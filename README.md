# stc-imagemin

Minify PNG, JPEG and GIF images for stc

## Install

```sh
npm install stc-imagemin --save
```

## How to use

```js
// stc.config.js

stc.workflow({
  imagemin: {plugin: imagemin}
})

```
默认 png 使用 pngquant 优化，jpg 使用 jpegtran 优化，gif 使用 gifsicle 优化。你也可以使用下面其他的优化工具：

## 其他优化工具

### png

* [optipng-bin](https://github.com/imagemin/optipng-bin)

```js

var optipng = require('optipng-bin');

stc.workflow({
  imagemin: {plugin: imagemin, options: {
    png: {adapter: optipng, args: ['-out', 'outfile', 'infile']}
  }}
})
```

* [zopflipng-bin](https://github.com/imagemin/zopflipng-bin)

```js

var zopflipng = require('zopflipng-bin');

stc.workflow({
  imagemin: {plugin: imagemin, options: {
    png: {adapter: zopflipng, args: ['-m', '--lossy_8bit', 'infile', 'outfile']}
  }}
})
```

* [pngcrush-bin](https://github.com/imagemin/pngcrush-bin)

```js

var pngcrush = require('pngcrush-bin');

stc.workflow({
  imagemin: {plugin: imagemin, options: {
    png: {adapter: pngcrush, args: ['-reduce', '-brute', 'infile', 'outfile']}
  }}
})
```



* [pngout-bin](https://github.com/imagemin/pngout-bin)

```js

var pngout = require('pngout-bin');

stc.workflow({
  imagemin: {plugin: imagemin, options: {
    png: {adapter: pngout, args: ['infile', 'outfile', '-s0', '-k0', '-f0']}
  }}
})
```


### jpg

* [mozjpeg-bin](https://github.com/imagemin/mozjpeg-bin)

```js

var mozjpeg = require('mozjpeg-bin');

stc.workflow({
  imagemin: {plugin: imagemin, options: {
    png: {adapter: mozjpeg, args: ['-outfile', 'outfile', 'infile']}
  }}
})
```


* [jpeg-recompress-bin](https://github.com/imagemin/jpeg-recompress-bin)

```js

var recompress = require('recompress-bin');

stc.workflow({
  imagemin: {plugin: imagemin, options: {
    png: {adapter: recompress, args: ['--quality high', '--min 60', 'infile', 'outfile']}
  }}
})
```

