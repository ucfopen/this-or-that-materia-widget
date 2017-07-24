let path       = require('path')
let webpack    = require('webpack');

let builddir   = path.join(__dirname, 'build')
let srcdir     = path.join(__dirname, 'src');
let devdir     = path.join(__dirname, 'node_modules', 'materia-widget-dev');
let baseconfig = path.join(devdir, 'webpack.dev-server.config.js');

let config     = require(baseconfig)({builddir: builddir, srcdir: srcdir});

Object.assign(config.entry, {
	creator: [
		path.join(srcdir, 'creator.coffee'),
		path.join(srcdir, 'creator.scss')
	],
	player: [
		path.join(srcdir, 'player.coffee'),
		path.join(srcdir, 'player.scss')
	],
});

module.exports = config;
