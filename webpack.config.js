const path = require('path')
const srcPath = path.join(__dirname, 'src') + path.sep
const outputPath = path.join(process.cwd(), 'build')

// load the reusable legacy webpack config from materia-widget-dev
const widgetWebpack = require('materia-widget-development-kit/webpack-widget')
const rules = widgetWebpack.getDefaultRules()
const copy = widgetWebpack.getDefaultCopyList()

const newCopy = [
	...copy,
	{
		from: path.join(__dirname, 'node_modules', 'hammerjs', 'dist', 'hammer.min.js'),
		to: path.join(outputPath, 'assets', 'js', 'hammer.min.js'),
	},
	{
		from: path.join(__dirname, 'src', '_guides', 'assets'),
		to: path.join(outputPath, 'guides', 'assets')
	},
	{
		from: path.join(__dirname, 'src', 'assets', 'fonts'),
		to: path.join(outputPath, 'assets', 'fonts')
	}
]

const entries = {
	'player': [
		path.join(srcPath, 'player.html'),
		path.join(srcPath, 'player.js'),
		path.join(srcPath, 'player.scss')
	],
	'creator': [
		path.join(srcPath, 'creator.html'),
		path.join(srcPath, 'creator.js'),
		path.join(srcPath, 'creator.scss'),
	],
	'scoreScreen': [
		path.join(srcPath, 'scoreScreen.html'),
		path.join(srcPath, 'scoreScreen.js'),
		path.join(srcPath, 'scoreScreen.scss')
	]
}

// uses options from babel.config.js
// placed there so that jest and webpack find it
const babelLoaderWithPolyfillRule = {
	test: /\.js$/,
	use: {
		loader: 'babel-loader'
	}
}

const customRules = [
	babelLoaderWithPolyfillRule,
	rules.loadAndPrefixSASS,
	rules.loadHTMLAndReplaceMateriaScripts,
	rules.copyImages,
]

// options for the build
let options = {
	copyList: newCopy,
	entries: entries,
	moduleRules: customRules
}

module.exports = widgetWebpack.getLegacyWidgetBuildConfig(options)

