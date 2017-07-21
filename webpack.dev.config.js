var path    = require('path'),
    webpack = require('webpack');

var devdir = path.join(__dirname, 'node_modules', 'materia-widget-dev');

var builddir = path.join(__dirname, 'build/'),
    srcdir   = path.join(__dirname, 'src/');

var baseconfig = path.join(devdir, 'webpack.base.config.js');

var config = require(baseconfig)({builddir: builddir, srcdir: srcdir});

Object.assign(config.entry, {
	'creator': [
		path.join(srcdir, 'creator.coffee'),
		path.join(srcdir, 'creator.scss')
	],
	'player': [
		path.join(srcdir, 'player.coffee'),
		path.join(srcdir, 'player.scss')
	],
});

module.exports = config;
