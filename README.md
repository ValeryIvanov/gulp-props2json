#[gulp](https://github.com/gulpjs/gulp)-props2json

[![npm version](https://badge.fury.io/js/gulp-props2json.svg)](http://badge.fury.io/js/gulp-props2json)
[![Build Status](https://travis-ci.org/ValeryIvanov/gulp-props2json.svg?branch=master)](https://travis-ci.org/ValeryIvanov/gulp-props2json)
[![Dependency Status](https://david-dm.org/ValeryIvanov/gulp-props2json.svg)](https://david-dm.org/ValeryIvanov/gulp-props2json)
[![Code Climate](https://codeclimate.com/github/ValeryIvanov/gulp-props2json/badges/gpa.svg)](https://codeclimate.com/github/ValeryIvanov/gulp-props2json)

> A [Gulp](https://github.com/gulpjs/gulp) plugin to convert [Java .properties](http://en.wikipedia.org/wiki/.properties) to [JSON](http://en.wikipedia.org/wiki/JSON)


## Install

```sh
npm install --save-dev gulp-props2json
```

## Usage

Add this to your `gulpfile.js`:

```js
var props2json = require('gulp-props2json');

// Generate a .json file
gulp.src('./src/*.properties')
  .pipe(props2json())
  .pipe(gulp.dest('./dist/'))

// Generate a .js file
gulp.src('./src/*.properties')
  .pipe(props2json({ outputType: 'js' }))
  .pipe(gulp.dest('./dist/'))
```


## API

### props2json([options])


#### options.outputType

Type: `String`

Default: `json`

Convert properties to `.js` or `.json` format.

**Note**: To force a `.js` output set this option `js` (without dot).


#### options.namespace

Type: `String`

Default: `null` for `.json` output and `props` for `.js` output

The namespace to use when defining properties. Javascript reserved words cannot be used here.
Invalid identifiers will be adjusted to be valid, and a warning will be printed in the console.


#### options.minify

Type: `Boolean`

Default: `true`

By default content `.js` and `.json` content is minified.
If `.json` output is generated and minification is turned off and no space is defined, then indentation with 2 spaces is used.
This can be overridden with space option.
[JSON.stringify](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#The_space_argument)


#### options.complexTypes

Type: `Boolean`

Default: `false`

By default every property value is treated as `String`. This option will try to convert every value to `JSON`.
For example (`String`) `"true"` value will be (`Boolean`) `true`.
[JSON.parse](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse)


#### options.nestedProps

Type: `Boolean`

Default: `false`

By default every property key will be treated as it is. But nesting is possible to create complex object.
If this option is turned on, then dot will be used as nesting delimiter. Nesting delimiter can be overridden with `nestingDelimiter` option.


#### options.nestingDelimiter

Type: `String`

Default: `.`

Nesting delimiter to be used with `nestedProps` option.


#### options.appendExt

Type: `Boolean`

Default: `false`

Append the extension (`.js` or `.json`) instead of replacing it.

_Useful if the property files does not have an extension._


#### options.space

Type: `Number` or `String`

Default: `null`

Control spacing in the resulting output. It has the same usage as for [JSON.stringify](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify)

_The option is used only when `.json` output is generated._


#### options.replacer

Type: `Function` or `Array`

Default: `null`

Further transform the resulting output. It has the same usage as for [JSON.stringify](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify)

_The option is used only when `.json` output is generated._


## Errors

`gulp-props2json` emits an 'error' event if something goes wrong.

To handle errors across your entire pipeline, see the
[gulp](https://github.com/gulpjs/gulp/blob/master/docs/recipes/combining-streams-to-handle-errors.md#combining-streams-to-handle-errors) documentation.


## License

MIT © [Valery Ivanov](https://github.com/ValeryIvanov/)
