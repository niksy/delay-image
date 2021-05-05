'use strict';

const path = require('path');
const fs = require('fs');
const {
	assert: assertModulePath,
	url: urlModulePath
} = require('node-libs-browser');

let config;

const isCI =
	typeof process.env.CI !== 'undefined' && process.env.CI !== 'false';
const isPR =
	typeof process.env.TRAVIS_PULL_REQUEST !== 'undefined' &&
	process.env.TRAVIS_PULL_REQUEST !== 'false';
const local = !isCI || (isCI && isPR);

const port = 0;

if (local) {
	config = {
		browsers: ['Chrome']
	};
} else {
	config = {
		hostname: 'bs-local.com',
		browserStack: {
			username: process.env.BROWSER_STACK_USERNAME,
			accessKey: process.env.BROWSER_STACK_ACCESS_KEY,
			startTunnel: true,
			project: 'delay-image',
			name: 'Automated (Karma)',
			build: 'Automated (Karma)'
		},
		customLaunchers: {
			'BS-Chrome': {
				base: 'BrowserStack',
				browser: 'Chrome',
				'browser_version': '72',
				os: 'Windows',
				'os_version': '7',
				project: 'delay-image',
				build: 'Automated (Karma)',
				name: 'Chrome'
			},
			'BS-Firefox': {
				base: 'BrowserStack',
				browser: 'Firefox',
				'browser_version': '65',
				os: 'Windows',
				'os_version': '7',
				project: 'delay-image',
				build: 'Automated (Karma)',
				name: 'Firefox'
			},
			'BS-Edge15': {
				base: 'BrowserStack',
				browser: 'Edge',
				'browser_version': '15',
				os: 'Windows',
				'os_version': '10',
				project: 'delay-image',
				build: 'Automated (Karma)',
				name: 'Edge15'
			}
		},
		browsers: ['BS-Chrome', 'BS-Firefox', 'BS-Edge15']
	};
}

module.exports = function (baseConfig) {
	baseConfig.set({
		basePath: '',
		frameworks: ['mocha', 'fixture'],
		files: [
			'test/**/*.css',
			'test/**/*.html',
			{
				pattern: 'test/**/*.jpg',
				watched: false,
				included: false,
				served: true,
				nocache: false
			},
			'test/**/.webpack.js'
		],
		exclude: [],
		preprocessors: {
			'test/**/*.html': ['html2js'],
			'test/**/.webpack.js': ['webpack', 'sourcemap']
		},
		reporters: ['mocha', 'coverage-istanbul'],
		port: port,
		colors: true,
		logLevel: baseConfig.LOG_INFO,
		autoWatch: false,
		client: {
			captureConsole: true
		},
		browserConsoleLogOptions: {
			level: 'log',
			format: '%b %T: %m',
			terminal: true
		},
		browserNoActivityTimeout: 60000,
		webpack: {
			mode: 'none',
			devtool: 'inline-source-map',
			resolve: {
				fallback: {
					assert: assertModulePath,
					url: urlModulePath
				}
			},
			module: {
				rules: [
					{
						test: /\.js$/,
						exclude: /node_modules/,
						use: [
							{
								loader: 'babel-loader'
							}
						]
					},
					{
						test: /\.js$/,
						exclude: /(node_modules|test)/,
						enforce: 'post',
						use: [
							{
								loader: 'istanbul-instrumenter-loader',
								options: {
									esModules: true
								}
							}
						]
					}
				]
			}
		},
		coverageIstanbulReporter: {
			dir: path.join(__dirname, 'coverage/%browser%'),
			fixWebpackSourcePaths: true,
			reports: ['html', 'text'],
			thresholds: {
				global: JSON.parse(
					fs.readFileSync(path.join(__dirname, '.nycrc'), 'utf8')
				)
			}
		},
		singleRun: true,
		concurrency: Infinity,
		...config
	});
};
