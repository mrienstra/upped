/* https://github.com/shuhei/contrib/blob/91f6510fa95321a75818bc0d3108e910710f8d07/gulp-lib-bundle.js */
/* Usage: https://github.com/shuhei/contrib/blob/d39fd5cbd91ea55dcd3ab397e8730c4ddbc867e7/gulpfile.js */
/* https://github.com/shuhei/contrib/commit/91f6510fa95321a75818bc0d3108e910710f8d07 */

var gutil = require('gulp-util');
var util = require('util');
var path = require('path');
var Readable = require('stream').Readable;

module.exports = function (libs, opts) {
  var cwd = opts.cwd ? path.resolve(opts.cwd) : process.cwd();
  var filepath = path.resolve(opts.path);
  var base = opts.base ? path.resolve(opts.base) : path.dirname(filepath);
  var contents = libs.map(function (lib) {
    return util.format("require('%s');", lib);
  }).join("\n");

  var fileOpts = {
    cwd: cwd,
    base: base,
    path: filepath,
    contents: new Buffer(contents)
  };

  var readable = new Readable({ objectMode: true });
  readable._read = function () {
    this.push(new gutil.File(fileOpts));
    this.push(null);
  };
  return readable;
};
