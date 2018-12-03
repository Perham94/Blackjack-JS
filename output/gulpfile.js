// function defaultTask(cb) {
//     // place code for your default task here
//     cb();
//   }
  
//   exports.default = defaultTask



//   var gulp = require('gulp');
// var uglify = require('gulp-uglify');
// var pump = require('pump');
 
// gulp.task('compress', function (cb) {
//   pump([
//         gulp.src('/*.js'),
//         uglify(),
//         gulp.dest('/dest')
//     ],
//     cb
//   );
// });

const minify = require('gulp-minify');
const { src, dest } = require('gulp');
// const babel = require('gulp-babel');
const uglify = require('gulp-uglify');

exports.default = function() {
  return src('./*.js')
    .pipe(minify())
    .pipe(dest('output/'));
}