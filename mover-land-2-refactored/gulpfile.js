// Load gulp plugins with 'require' function of nodejs
// --------------------------------------------------------

var gulp             = require('gulp'),
    plumber          = require('gulp-plumber'),
    del              = require('del'),
    imagemin         = require('gulp-imagemin'),
    imageminPngquant = require('imagemin-pngquant'),
    spritesmith      = require('gulp.spritesmith'),
    merge            = require('merge-stream'),
    buffer           = require('vinyl-buffer'),
    changed          = require('gulp-changed'),
    svgSprite        = require('gulp-svg-sprite'),
    jade             = require('gulp-jade'),
    stylus           = require('gulp-stylus'),
    autoprefixer     = require('gulp-autoprefixer'),
    cssshrink        = require('gulp-cssshrink'),
    nib              = require('nib'),
    rupture          = require('rupture'),
    poststylus       = require('poststylus'),
    lost             = require('lost'),
    concat           = require('gulp-concat'),
    uglify           = require('gulp-uglify'),
    browserSync      = require('browser-sync').create(),
    reload           = browserSync.reload,
    watch            = require('gulp-watch'),
    gzip             = require('gulp-gzip'),
    compress         = require('compression'),
    middleware       = require('connect-gzip-static')('./dist/'),
    imageminOptipng  = require('imagemin-optipng'),
    pngquant         = require('imagemin-pngquant');

// --------------------------------------------------------



// Path configs
// --------------------------------------------------------

var path = {
  app : {
    fonts: 'app/fonts/**/*.*',
    initial_img: 'app/img/initial/**/*.*',
    compressed_img: 'app/img/compressed/',
    imgForSprite: 'app/img/compressed/*.png',
    imgForRetinaSprite: 'app/img/compressed/*@2x.png',
    spriteCss: 'app/stylus/partials/',
    del_compressed_img: 'app/img/compressed/*',
    compressed_img_bkg: 'app/img/compressed/bkg/**/*.*',
    minified_svg: 'app/img/compressed/ico/**/*.svg',
    sprite_svg: 'app/stylus/partials/',
    del_sprite_partials: 'app/stylus/partials/sprite/*',
    sprite_svg_img: 'app/stylus/partials/sprite/svg-sprite.svg',
    jade: 'app/jade/*.jade',
    stylus: 'app/stylus/*.styl',
    del_styl: 'app/stylus/partials/*sprite.styl',
    js: 'app/js/**/*.js',
    bowerComponents: 'app/bower_components/**/*.*',
    views: 'app/jade/views/**/*.*',
    watch_stylus: 'app/stylus/**/*.styl',
    jquery: 'app/bower_components/jquery/dist/jquery.js',
    mousewheel: 'app/bower_components/jquery-mousewheel/jquery.mousewheel.js',
    maskedinput: 'app/bower_components/jquery.maskedinput/dist/jquery.maskedinput.js',
    jcarousel: 'app/bower_components/jcarousel/dist/jquery.jcarousel.js'
  },

  dist: {
    del: 'dist/*',
    fonts: 'dist/fonts/',
    bkg_img: 'dist/css/bkg',
    svg_sprite: 'dist/css/sprite/',
    minified_html: 'dist/',
    css: 'dist/css/',
    js: 'dist/js/',
    pngSprite: 'dist/css/sprite/',
    views: 'dist/views/',
    bowerComponents: 'dist/bower_components'
  }
};

// --------------------------------------------------------



// Set Functions for tasks
// --------------------------------------------------------

var gzip_opts = {
  append: false,
  extension: 'gz',
  gzipOptions: { level: 9 }
};

function emptyFolders() {
  return del([
    path.app.del_compressed_img,
    path.app.del_sprite_partials,
    path.app.del_styl,
    path.dist.del
    ]);
}

function copyFiles() {
  return gulp.src(path.app.fonts)
    .pipe(plumber())
    .pipe(gulp.dest(path.dist.fonts))
    .on('end', function() {
      gulp.src(path.app.bowerComponents)
      .pipe(gulp.dest(path.dist.bowerComponents));
    })
    .pipe(reload({stream: true}));
}

// Define img compression opts
imagemin_opts = {
  optimizationLevel: 1,
  use: [pngquant()]
  // use: [imagemin()]
  // progressive: true
};

function minifyImg() {
  return gulp.src(path.app.initial_img)
    .pipe(plumber())
    .pipe(changed(path.app.compressed_img))
    .pipe(imagemin(imagemin_opts))
    .pipe(gulp.dest(path.app.compressed_img))
    .on('end', function() {
      return gulp.src(path.app.compressed_img_bkg)
        .pipe(gulp.dest(path.dist.bkg_img));
    });
}

// Define svg spriting opts
// Refactored SVG template - '../node-modules/svg-sprite/tmpl/css/sprite.styl'
// Each separate initial svg after spriting has output as jade element 'i'
// with a common and specific svg class with proper css props :
// i.svg-common.{{initial_svg_filename}}
svgSpriteConfig     = {
  mode            : {
    sprite1     : {
        mode    : 'css',
        render  : {
          styl: {dest: './svg-sprite.styl'}
        },
        dest: './',
        sprite : 'sprite/svg-sprite.svg',
        // Set 'bust' to true - Add a content based hash to the name of the sprite file so that 
        // clients reliably reload the sprite when it's content changes («cache busting»).
        //  Defaults to false except for «css» and «view» sprites.
        bust: false,
        common: 'svg-common'
    }
  }
};

// config for png spriting
PngSpriteOpts = {
  // set params for x2 retina sprite
  retinaSrcFilter: [path.app.imgForRetinaSprite], // IMPORTANT! : both x1 and x2 retina images should be in the same folder
  retinaImgName: 'png-sprite@2x.png',
  retinaImgPath: 'sprite/png-sprite@2x.png',
  // set params for x1 sprite
  imgName: 'png-sprite.png',
  cssName: 'png-sprite.styl',
  imgPath: 'sprite/png-sprite.png',
  cssTemplate: 'stylus.template.handlebars'
  // To optimize amount of output code in .styl default templates were changed.
  // Refactored template: temp2/stylus.template.handlebars
  // Initial default templates: 'temp2/node_modules/gulp.spritesmith/node_modules/spritesheet-templates/lib/'
};

function createSprite() {
  var spriteData = gulp.src(path.app.imgForSprite)
    .pipe(plumber())
    .pipe(spritesmith(PngSpriteOpts));

  var imgStream = spriteData.img
    .pipe(buffer())
    .pipe(imageminPngquant({quality: '65-80', speed: 4})())
    .pipe(gulp.dest(path.dist.pngSprite));

  var cssStream = spriteData.css
    .pipe(gulp.dest(path.app.spriteCss));

  return merge(imgStream, cssStream);
}

function compileJade() {
  gulp.src(path.app.jade)
    .pipe(plumber())
    .pipe(jade(
      // {pretty: true}
    ))
    // .pipe(gzip(gzip_opts))
    .pipe(gulp.dest(path.dist.minified_html))
    .on('end', function() {
      gulp.src(path.app.views)
      .pipe(gulp.dest(path.dist.views));
    })
    .pipe(reload({stream: true}));
}

function compileStylus() {
  return gulp.src(path.app.stylus)
    .pipe(plumber())
    .pipe(stylus({
      'include css': true,
      use: [
        nib(),
        // Set readable media-rules as block mixins in styles.styl
        rupture(),
        // Add a responsive grid 'lost'
        poststylus(['lost'])
      ],
      import: [
        'nib'
      ]
    }))
    .pipe(autoprefixer()) 
    .pipe(cssshrink())
    // .pipe(gzip(gzip_opts))
    .pipe(gulp.dest(path.dist.css))
    .pipe(reload({stream: true}));
}

function compileJS() {
  return gulp.src([
    path.app.jquery,
    path.app.mousewheel,
    path.app.maskedinput,
    path.app.jcarousel,
    path.app.js
    ])
    .pipe(concat('sapp.js', {newLine: ';'}))
    .pipe(uglify())
    // .pipe(gzip(gzip_opts))
    // .pipe(babel())
    .pipe(gulp.dest(path.dist.js))
    .pipe(reload({stream: true}));
}

// --------------------------------------------------------



// Set Gulp tasks
// --------------------------------------------------------

// Empty folders before build
gulp.task('emptyFolders', function () {
  return emptyFolders();
});

// Copy fonts from app to dist
gulp.task('copyFiles', ['emptyFolders'], function() {
  return copyFiles();
});

// Compress jpg & png
gulp.task('minifyImg', ['emptyFolders'], function() {
  return minifyImg();
});

// Create sprite (x1 and x2 retina) from .png pics
gulp.task('createSprite', ['minifyImg'], function() {
  return createSprite();
});

// Compile Jade
gulp.task('compileJade', ['emptyFolders'], function() {
  return compileJade();
});

// Compile stylus
gulp.task('compileStylus', ['createSprite'], function() {
  return compileStylus();
});

// Compile js
gulp.task('compileJS', ['emptyFolders'], function() {
  return compileJS();
});

// --------------------------------------------------------



// Build project
// --------------------------------------------------------
gulp.task('build', [
  'emptyFolders',
  'copyFiles',
  'minifyImg',
  'createSprite',
  'compileJade',
  'compileStylus',
  'compileJS',
]);
// --------------------------------------------------------



// Config for devServer
var serverConfig = {
  server: {
    baseDir: "dist/",
    // Comment LoC 257 for non-gzip build.
    // middleware: [compress()]
    // Uncomment LoC 259 - 262 for non-gzip build.
    middleware: function (req, res, next) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      next();
    }
  },
  files: ['dist/*.html', 'dist/css/*.css', 'dist/css/sprite/*.svg', 'dist/js/*.js'],
  tunnel: false,
  host: 'localhost',
  port: 3000,
  logPrefix: "Vaan_logprefix",
  open: true,
  injectChanges: true
};

gulp.task('webserver', ['build'], function () {
  // Uncomment LoC 320 for non-gzip build.
  browserSync.init(serverConfig);

  // Comment LoC 323 - 331 for non-gzip build.
  // browserSync.init(
  //   serverConfig,
  //   function (err, bs) {
  //     bs.addMiddleware("*", middleware, {
  //       override: true
  //     });
  //   }
  // );
});




// Watch changes & livereload
// --------------------------------------------------------

gulp.task('watch', ['webserver'], function() {

  watch(path.app.fonts, function() {
    return copyFiles();
  });
  
  watch(path.app.initial_img, function() {
    return minifyImg();
  });

  watch(path.app.jade, function() {
    return compileJade();
  });

  watch(path.app.watch_stylus, function() {
    return compileStylus();
  });
  
  watch(path.app.js, function() {
    return compileJS();
  });

});

// --------------------------------------------------------
