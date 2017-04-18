var clean_name = 'this-or-that';

var autoprefixer = require('autoprefixer'),
    clean        = require('clean-webpack-plugin'),
    copy         = require('copy-webpack-plugin'),
    extract      = require('extract-text-webpack-plugin'),
    path         = require('path'),
    webpack      = require('webpack'),
    zip          = require('zip-webpack-plugin');

var builddir  = path.join(__dirname, 'build/'),
    srcdir    = path.join(__dirname, 'src/');

//creators and players may reference materia core files directly, rather than hard-coding the actual location of those files
//the build process will replace those references with the current relative paths to those files
var materiaJSReplacements = [
	{ search: /src=(\\?("|')?)materia.enginecore.js(\\?("|')?)/g,      replace: 'src=\\"../../../js/materia.enginecore.js\\"' },
	{ search: /src=(\\?("|')?)materia.score.js(\\?("|')?)/g,           replace: 'src=\\"../../../js/materia.score.js\\"' },
	{ search: /src=(\\?("|')?)materia.creatorcore.js(\\?("|')?)/g,     replace: 'src=\\"../../../js/materia.creatorcore.js\\"' },
	{ search: /src=(\\?("|')?)materia.storage.manager.js(\\?("|')?)/g, replace: 'src=\\"../../../js/materia.storage.manager.js\\"' },
	{ search: /src=(\\?("|')?)materia.storage.table.js(\\?("|')?)/g,   replace: 'src=\\"../../../js/materia.storage.table.js\\"' }
];

var booleanLookup = {
	'true':  true,
	'false': false
};

module.exports = function(args){
	var minify = true;
	var mangle = true;

	if(args)
	{
		minify = 'minify' in args ? booleanLookup[args.minify] : true;
		mangle = 'mangle' in args ? booleanLookup[args.mangle] : true;
	}

	config = {
		target: 'node',
		entry: {
			'creator.js': [
				path.join(srcdir, 'creator.coffee')
			],
			'player.js': [
				path.join(srcdir, 'player.coffee')
			],
			'creator.css': [
				path.join(srcdir, 'creator.html'),
				path.join(srcdir, 'creator.scss')
			],
			'player.css': [
				path.join(srcdir, 'player.html'),
				path.join(srcdir, 'player.scss')
			]
		},
		output: {
			path: builddir,
			filename: '[name]',
			publicPath: ''
		},
		module: {
			rules: [
				{
					test: /\.coffee$/,
					exclude: /node_modules/,
					loader: extract.extract({
						fallback: 'coffee-loader',
						use: ['raw-loader', 'coffee-loader']
					})
				},
				{
					test: /\.(jpe?g|png|gif|svg)$/i,
					loader: 'file-loader',
					query: {
						emitFile: false,
						publicPath: 'assets/img/',
						name: '[name].[ext]'
					}
				},
				{
					test: /\.html$/,
					exclude: /node_modules/,
					use: [
						{
							loader: 'file-loader',
							options: {
								name: '[name].html'
							}
						},
						{
							loader: 'extract-loader',
							query: 'publicPath=/'
						},
						{
							loader: 'string-replace-loader',
							options: {
								multiple: materiaJSReplacements
							}
						},
						{loader: 'html-loader'}
					]
				},
				{
					test: /\.s[ac]ss$/,
					exclude: /node_modules/,
					loader: extract.extract({
						fallback: 'style-loader',
						use: ['raw-loader', 'postcss-loader', 'sass-loader']
					})
				}
			]
		},
		plugins: [
			new clean(['build']),
			new copy([
				{
					flatten: true,
					from: srcdir+'*.json',
					to: builddir,
				},
				{
					flatten: true,
					from: srcdir+'*.yaml',
					to: builddir,
				},
				{
					from: srcdir+'_icons',
					to: builddir+'img',
					toType: 'dir'
				},
				{
					flatten: true,
					from: srcdir+'_score',
					to: builddir+'_score-modules',
					toType: 'dir'
				},
				{
					from: srcdir+'_screen-shots',
					to: builddir+'img/screen-shots',
					toType: 'dir'
				},
				{
					from: srcdir+'assets',
					to: builddir+'assets',
					toType: 'dir'
				}
			]),
			new extract({
				filename: '[name]'
			}),
			new webpack.LoaderOptionsPlugin({
				minimize: minify,
				options: {
					postcss: [ autoprefixer ]
				}
			}),
			new zip({
				path: builddir+'_output',
				filename: clean_name,
				extension: 'wigt'
			})
		]
	};

	if(minify || mangle)
	{
		config.plugins.push(new webpack.optimize.UglifyJsPlugin({
			compress: mangle,
			mangle: mangle
		}));
	}

	return config;
};