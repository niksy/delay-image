/* jshint latedef:false */

module.exports = function ( grunt ) {

	grunt.initConfig({

		pkg: grunt.file.readJSON('package.json'),

		meta: {
			banner: '/*! <%= pkg.name %> <%= pkg.version %> - <%= pkg.description %> | Author: <%= pkg.author %>, <%= grunt.template.today("yyyy") %> | License: <%= pkg.license %> */\n'
		},

		concat: {
			dist: {
				options: {
					stripBanners: true,
					banner: '<%= meta.banner %>'
				},
				files: {
					'dist/<%= pkg.name %>.js': ['compiled/<%= pkg.main %>']
				}
			}
		},

		uglify: {
			dist: {
				options: {
					banner: '<%= meta.banner %>'
				},
				files: {
					'dist/<%= pkg.name %>.min.js': ['compiled/<%= pkg.main %>']
				}
			}
		},

		bump: {
			options: {
				files: ['package.json', 'bower.json'],
				updateConfigs: ['pkg'],
				commit: true,
				commitMessage: 'Release %VERSION%',
				commitFiles: ['-a'],
				createTag: true,
				tagName: '%VERSION%',
				tagMessage: '',
				push: false
			}
		},

		jscs: {
			main: {
				options: {
					config: '.jscsrc'
				},
				files: {
					src: [
						'<%= pkg.main %>',
						'lib/**/*.js'
					]
				}
			}
		},

		jshint: {
			main: {
				options: {
					jshintrc: '.jshintrc'
				},
				src: [
					'<%= pkg.main %>',
					'lib/**/*.js'
				]
			}
		},

		browserify: {
			options: {
				browserifyOptions: {
					standalone: 'jQuery.fn.delayImages'
				}
			},
			standalone: {
				options: {
					plugin: ['bundle-collapser/plugin'],
					preBundleCB: function ( b ) {
						updateBrowserifyShim(true, {
							'kist-inviewport': 'global:$.fn.inViewport',
							'kist-loader': 'global:$.kist.loader'
						});
					},
					postBundleCB: function ( err, src, next ) {
						updateBrowserifyShim(false, null, function () {
							next(err, src);
						});
					}
				},
				files: {
					'compiled/<%= pkg.main %>': ['<%= pkg.main %>']
				}
			}
		},

		connect: {
			test:{
				options: {
					open: {
						target: 'http://0.0.0.0:8001'
					}
				}
			}
		},

		throttle: {
			test: {
				'remote_host': 'localhost',
				'remote_port': 8000,
				'local_port': 8001,
				'downstream': 200000,
				'keepalive': true
			}
		},

		'compile-handlebars': {
			test: {
				templateData: {
					bower: '../../../bower_components',
					compiled: '../../../compiled',
					assets: 'assets',
					main: '<%= pkg.main %>'
				},
				partials: 'test/manual/templates/partials/**/*.hbs',
				template: 'test/manual/templates/*.hbs',
				output: 'compiled/test/manual/*.html'
			}
		},

		copy: {
			test: {
				files:[{
					expand: true,
					cwd: 'test/manual/assets/',
					src: ['**'],
					dest: 'compiled/test/manual/assets/'
				}]
			}
		},

		concurrent: {
			options: {
				logConcurrentOutput: true
			},
			test: ['watch','connect:test:keepalive','throttle:test']
		},

		watch: {
			options: {
				spawn: false
			},
			hbs: {
				files: 'test/manual/**/*.hbs',
				tasks: ['compile-handlebars:test']
			},
			browserify: {
				files: ['<%= pkg.main %>', 'lib/**/*.js'],
				tasks: ['browserify:standalone']
			}
		},

		'curl-dir': {
			test: {
				src: [
					'http://farm4.staticflickr.com/3661/3366637773_7fc46dffbe.jpg',
					'http://farm4.staticflickr.com/3329/3521766128_90a7719f12.jpg',
					'http://farm4.staticflickr.com/3785/8935657788_73f5daa6e3.jpg',
					'http://farm4.staticflickr.com/3304/3655338482_bdab8415f9.jpg',
					'http://farm4.staticflickr.com/3452/3961281995_a46d6f27e1.jpg',
					'http://farm9.staticflickr.com/8251/8522154040_9ec4dcb982.jpg',
					'http://farm5.staticflickr.com/4024/4567925035_9a513b1c75.jpg',
					'http://farm3.staticflickr.com/2841/9244258769_a16703a46e.jpg',
					'http://farm2.staticflickr.com/1408/5170192357_dc1c163fb1_z.jpg',
					'http://farm8.staticflickr.com/7191/6813794686_968e2569cd_z.jpg',
					'http://farm2.staticflickr.com/1416/5170155619_b4c5d2e558_z.jpg',
					'http://farm2.staticflickr.com/1336/5170798574_0b1cfc8d88.jpg',
					'http://farm4.staticflickr.com/3256/2648651259_fd87e88916.jpg',
					'http://farm8.staticflickr.com/7330/9738398077_3800ac99ee.jpg',
					'http://farm8.staticflickr.com/7168/6799004729_f6bc1cbbc1.jpg',
					'http://farm8.staticflickr.com/7161/6798966357_7d59c92bec.jpg'
				],
				dest: 'compiled/test/manual/assets/images'
			}
		}

	});

	require('load-grunt-tasks')(grunt);

	grunt.registerTask('test', function () {
		var tasks = ['compile-handlebars:test','copy:test','browserify:standalone'];
		if ( grunt.option('watch') ) {
			tasks.push('concurrent:test');
		}
		if ( grunt.option('download-images') ) {
			tasks.push('curl-dir:test');
		}
		grunt.task.run(tasks);
	});

	grunt.registerTask('stylecheck', ['jshint:main', 'jscs:main']);
	grunt.registerTask('default', ['stylecheck', 'browserify:standalone', 'concat', 'uglify']);
	grunt.registerTask('releasePatch', ['bump-only:patch', 'default', 'bump-commit']);
	grunt.registerTask('releaseMinor', ['bump-only:minor', 'default', 'bump-commit']);
	grunt.registerTask('releaseMajor', ['bump-only:major', 'default', 'bump-commit']);

};

/**
 * @param  {Boolean}   update
 * @param  {Object}   props
 * @param  {Function} cb
 */
function updateBrowserifyShim ( update, props, cb ) {
	props = props || {};
	var file = 'package.json';
	var fs = require('fs');
	var pkg = require('./' + file);

	if ( update ) {
		fs.writeFileSync('./_' + file, fs.readFileSync('./' + file));
		for ( var prop in props ) {
			if ( props.hasOwnProperty(prop) ) {
				pkg['browserify-shim'][prop] = props[prop];
			}
		}
		fs.writeFileSync('./' + file, JSON.stringify(pkg));
	} else {
		fs.writeFileSync('./' + file, fs.readFileSync('./_' + file));
		fs.unlinkSync('./_' + file);
	}

	if ( cb ) {
		cb();
	}
}
