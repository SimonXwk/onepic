var gulp            = require('gulp');
var plumber         = require('gulp-plumber');
var browserSync     = require('browser-sync').create();
var rename          = require('gulp-rename');
var sass            = require('gulp-sass');
var autoprefixer    = require('gulp-autoprefixer');


var config = {
    baseDir: '.',
    vendorDir: 'app/static/vendor',
    vendorHighChartDir: 'app/static/vendor/hc',
    cssDir: 'app/static/css',
    sassPattern: 'app/**/*.scss',
    htmlPattern: 'app/**/*.html',
    jsPattern: 'app/**/*.js',
    sassBuildGlob: ['app/static/scss/*.scss', '!app/static/scss/_*.scss']

};


// Move HighChart Libraries into app/static/vendor/hc folder :
gulp.task('vendor-highchart', function() {
  return gulp.src([
      'node_modules/highcharts/highcharts.js',
      'node_modules/highcharts/highcharts-more.js',
      'node_modules/highcharts/modules/exporting.js',
      'node_modules/highcharts/modules/sankey.js',
      'node_modules/highcharts/modules/data.js',
      'node_modules/highcharts/modules/drilldown.js',
      'node_modules/highcharts/modules/solid-gauge.js',
    ])
    .pipe(plumber())
    .pipe(gulp.dest(config.vendorHighChartDir))
});

// Move the Framework libraries(css and javascripts) into app/static/vendor folder :
gulp.task('vendor-general', function() {
  return gulp.src([
      'node_modules/bootstrap/dist/css/bootstrap.min.css',
      'node_modules/font-awesome/css/font-awesome.min.css',
      'node_modules/bootstrap/dist/js/bootstrap.min.js',
      'node_modules/bootstrap/dist/js/bootstrap.min.js.map',
      'node_modules/jquery/dist/jquery.min.js',
      'node_modules/popper.js/dist/umd/popper.min.js',
      'node_modules/popper.js/dist/umd/popper.min.js.map',
      'node_modules/echarts/dist/echarts-en.min.js',
      'node_modules/malihu-custom-scrollbar-plugin/jquery.mCustomScrollbar.concat.min.js',
      'node_modules/malihu-custom-scrollbar-plugin/jquery.mCustomScrollbar.css',
      'node_modules/sketch-js/js/sketch.min.js'
    ])
    .pipe(plumber())
    .pipe(gulp.dest(config.vendorDir))
});

// Vendor Libraries
gulp.task('vendor', ['vendor-general', 'vendor-highchart']);


// Compile sass into CSS & auto-inject into browsers
gulp.task('sass', function() {
  return gulp.src('**/static/scss/*.scss', {base: "./"})
    .pipe(plumber())
    // Compile sass into CSS
    .pipe(sass({
        outputStyle: 'compressed'  // nested, expanded, compact, compressed
    }).on('error', sass.logError))
    .pipe(autoprefixer('last 2 versions'))
    // .pipe(cleanCSS({level: {1: {specialComments: 'all'}}}))
    .pipe(rename(function (path) {
        path.basename += ".min";
        path.dirname += "/../css";
    }))
    .pipe(gulp.dest('./')) // This will direct the output to a css dir that is a sibling to the input scss dir.
    //auto-inject into browsers
    .pipe(browserSync.stream());
});




// Static Server + watching scss/html files
gulp.task('serve', ['sass'], function() {

    browserSync.init({
        // server: "./app",
        proxy: 'localhost',
        // port: 80,
        baseDir: ["./app"]
    });

    gulp.watch(config.sassPattern, ['sass']);
    gulp.watch(config.jsPattern).on('change', browserSync.reload);
    gulp.watch(config.htmlPattern).on('change', browserSync.reload);
});



gulp.task('default', ['serve']);