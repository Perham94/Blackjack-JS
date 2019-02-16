const { src, dest } = require('gulp');
const minify = require('gulp-minify');
const imagemin = require('gulp-imagemin');
let cleanCSS = require('gulp-clean-css');


function minifys() {
  return src('./*.js')
    .pipe(minify())
    .pipe(dest('output/'))
}

exports.minifys = minifys;

function minifyCSS() {
  return src('./*.css').pipe(cleanCSS({ debug: true }, (details) => {
    console.log(`${details.name}: ${details.stats.originalSize}`);
    console.log(`${details.name}: ${details.stats.minifiedSize}`);
  }))
    .pipe(dest('output/'));
}

exports.minifyCSS = minifyCSS;

const htmlmin = require('gulp-htmlmin');
function minifyHTML(){
  return src('./*.html')
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(dest('output/'));
}

exports.minifyHTML = minifyHTML;


