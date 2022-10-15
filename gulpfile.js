let project_folder = 'dist';
let source_folder = 'app';

let fs = require('fs');


let { src, dest, watch, parallel, series } = require('gulp');

let scss = require('gulp-sass')(require('sass')),
	browsersync = require('browser-sync').create(),
	group_media = require('gulp-group-css-media-queries'),
	autoprefixer = require('gulp-autoprefixer'),
	concat = require('gulp-concat'),
	clean_css = require('gulp-clean-css'),
	rename = require('gulp-rename'),
	uglify = require('gulp-uglify-es').default,
	imagemin = require('gulp-imagemin'),
	del = require('del');

let svgSprite = require('gulp-svg-sprite'),
	ttf2woff = require('gulp-ttf2woff'),
	ttf2woff2 = require('gulp-ttf2woff2'),
	fonter = require('gulp-fonter'),
	fileinclude = require('gulp-file-include'),
	webp = require('gulp-webp'),
	webphtml = require('gulp-webp-html'),
	webpcss = require('gulp-webpcss');




function browserSync() {
	browsersync.init({
		server: {
			baseDir: source_folder + "/"
		},
		port: 3000,
		notify: false
	});
}

function html() {
	return src(source_folder + '/**/*.html')
		// .pipe(webphtml())
		// .pipe(fileinclude())
		// .pipe(dest(project_folder + '/'))
		.pipe(browsersync.stream())

}

function css() {
	return src(source_folder + '/scss/style.scss')
		.pipe(
			scss({
				outputStyle: 'expanded'
			}).on('error', scss.logError)
		)
		.pipe(group_media())
		.pipe(
			autoprefixer({
				grid: true,
				overrideBrowserslist: ['last 8 versions'],
				cascade: true
			})
		)
		// .pipe(webpcss({
		// 	webpClass: '.webp',
		// 	noWebpClass: '.no-webp'
		// }))
		.pipe(dest(source_folder + '/css/'))
		.pipe(clean_css())
		.pipe(
			rename({
				suffix: '.min'
			})
		)
		.pipe(dest(source_folder + '/css/'))
		.pipe(browsersync.stream())
}

function style() {
	return src([
		'node_modules/normalize.css/normalize.css',
	])
		.pipe(concat('_libs.scss'))
		.pipe(clean_css())
		.pipe(dest(source_folder + '/scss/'))
		.pipe(browsersync.stream())
}

function script() {
	return src([
		'node_modules/jquery/dist/jquery.js',
		'node_modules/slick-carousel/slick/slick.js',
	])
		.pipe(concat('libs.min.js'))
		.pipe(uglify())
		.pipe(dest(source_folder + '/js/'))
		.pipe(browsersync.stream())
}

function js() {
	return src([
		source_folder + '/js/libs.min.js',
		source_folder + '/js/main.js'
	])
		.pipe(concat('main.min.js'))
		.pipe(uglify())
		.pipe(dest(source_folder + '/js/'))
		.pipe(browsersync.stream())
}

function images() {
	return src(source_folder + '/images/**/*.{jpg,png,svg,gif,ico,webp}')
		// .pipe(webp({
		// 	quality: 70
		// }))
		// .pipe(dest(project_folder + '/images/'))
		// .pipe(src(source_folder + '/images/**/*.{jpg,png,svg,gif,ico,webp}'))
		.pipe(imagemin([
			imagemin.gifsicle({ interlaced: true }),
			imagemin.mozjpeg({ quality: 75, progressive: true }),
			imagemin.optipng({ optimizationLevel: 5 }),
			imagemin.svgo({
				plugins: [
					{ removeViewBox: true },
					{ cleanupIDs: false }
				]
			})
		]))
		.pipe(dest(project_folder + '/images/'))
		.pipe(browsersync.stream())
}

function svgsprite() {
	return src([source_folder + '/iconsprite/*.svg'])
		.pipe(svgSprite({
			mode: {
				stack: {
					sprite: "../icons/icons.svg", //sprite file name
					// example: true
				}
			}
		}))
		.pipe(dest(project_folder + "/images/"))
}

function fonts() {
	src(source_folder + '/fonts/*.ttf')
		.pipe(ttf2woff())
		.pipe(dest(source_folder + '/fonts/'))
	return src(source_folder + '/fonts/*.ttf')
		.pipe(ttf2woff2())
		.pipe(dest(source_folder + '/fonts/'))
}

function otf2ttf() {
	return src([source_folder + '/fonts/*.otf'])
		.pipe(fonter({
			formats: ['ttf']
		}))
		.pipe(dest(source_folder + '/fonts/'))
}

function fontsStyle(params) {
	let file_content = fs.readFileSync(source_folder + '/scss/_fonts.scss');
	if (file_content == '') {
		fs.writeFile(source_folder + '/scss/_fonts.scss', '', cb);
		return fs.readdir(project_folder + '/fonts/', function (err, items) {
			if (items) {
				let c_fontname;
				for (var i = 0; i < items.length; i++) {
					let fontname = items[i].split('.');
					fontname = fontname[0];
					if (c_fontname != fontname) {
						fs.appendFile(source_folder + '/scss/_fonts.scss', '@include font("' + fontname + '", "' + fontname + '", "400", "normal");\r\n', cb);
					}
					c_fontname = fontname;
				}
			}
		})
	}
}

function cb() { }

function watchFiles() {
	watch([source_folder + '/**/*.html'], html);
	watch([source_folder + '/scss/**/*.scss'], css);
	watch([source_folder + '/js/**/*.js', '!' + source_folder + '/js/main.min.js'], js);
	watch([source_folder + '/images/**/*.{jpg,png,svg,gif,ico,webp}'], images);
}

function buildFiles() {
	return src([
		source_folder + '/**/*.html',
		// source_folder + '/css/style.css',
		source_folder + '/css/style.min.css',
		source_folder + '/js/main.min.js',
		source_folder + '/fonts/*.{woff,woff2}',
	], { base: source_folder })
		.pipe(dest(project_folder))
}

function clean() {
	return del(project_folder + '/')
}

let buildDev = series(clean, parallel(html, css, style, script, js, images, fonts, otf2ttf), buildFiles, fontsStyle);
let watching = parallel(buildDev, browserSync, watchFiles);

exports.html = html;
exports.css = css;
exports.style = style;
exports.script = script;
exports.js = js;
exports.images = images;
exports.svgsprite = svgsprite;
exports.fonts = fonts;
exports.otf2ttf = otf2ttf;
exports.fontsStyle = fontsStyle;
exports.buildFiles = buildFiles;
exports.clean = clean;
exports.buildDev = buildDev;
exports.watching = watching;

exports.watchFiles = watchFiles;


exports.default = watching;