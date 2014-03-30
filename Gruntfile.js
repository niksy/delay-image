module.exports = function (grunt) {

	grunt.initConfig({

		pkg: grunt.file.readJSON('package.json'),

		meta: {
			banner: '<%= pkg.name %> <%= pkg.version %> - <%= pkg.description %> | Author: <%= pkg.author %>, <%= grunt.template.today("yyyy") %> | License: <%= pkg.license %>',
			defaultBanner: '/* <%= meta.banner %> */\n',
			unstrippedBanner: '/*! <%= meta.banner %> */\n'
		},

		concat: {
			main: {
				options: {
					stripBanners: true,
					banner: '<%= meta.defaultBanner %>'
				},
				files: {
					'dist/kist-postimg.js': ['src/kist-postimg.js']
				}
			},
			withDeps: {
				files: {
					'dist/kist-postimg.withDeps.js': [
						'bower_components/jquery-throttle-debounce/jquery.ba-throttle-debounce.js',
						'bower_components/kist-inview/dist/kist-inview.js',
						'bower_components/kist-loaders/dist/util/createCache.js',
						'bower_components/kist-loaders/dist/loadImage.js',
						'dist/kist-postimg.js'
					],
					'dist/kist-postimg.withDeps.min.js': [
						'bower_components/jquery-throttle-debounce/jquery.ba-throttle-debounce.min.js',
						'bower_components/kist-inview/dist/kist-inview.min.js',
						'bower_components/kist-loaders/dist/util/createCache.min.js',
						'bower_components/kist-loaders/dist/loadImage.min.js',
						'dist/kist-postimg.min.js'
					]
				}
			}
		},

		uglify: {
			main: {
				options: {
					banner: '<%= meta.unstrippedBanner %>'
				},
				files: {
					'dist/kist-postimg.min.js': ['src/kist-postimg.js']
				}
			}
		},

		jscs: {
			main: {
				options: {
					config: '.jscs.json'
				},
				files: {
					src: [
						'src/kist-postimg.js'
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
					'src/kist-postimg.js'
				]
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
				tagMessage: 'Version %VERSION%',
				push: false
			}
		}

	});

	grunt.loadNpmTasks( 'grunt-contrib-jshint' );
	grunt.loadNpmTasks( 'grunt-jscs-checker' );
	grunt.loadNpmTasks( 'grunt-contrib-concat' );
	grunt.loadNpmTasks( 'grunt-contrib-uglify' );
	grunt.loadNpmTasks( 'grunt-bump' );

	grunt.registerTask( 'stylecheck', ['jshint:main', 'jscs:main'] );
	grunt.registerTask( 'default', ['concat:main', 'uglify:main', 'concat:withDeps'] );
	grunt.registerTask( 'releasePatch', ['bump-only:patch', 'default', 'bump-commit'] );
	grunt.registerTask( 'releaseMinor', ['bump-only:minor', 'default', 'bump-commit'] );
	grunt.registerTask( 'releaseMajor', ['bump-only:major', 'default', 'bump-commit'] );


};
