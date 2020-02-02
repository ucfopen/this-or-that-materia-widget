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
	}
]

const entries = {
	'creator.js': [
		'./src/creator.js'
	],
	'player.js': [
		'./src/player.js'
	],
	'creator.css': ['./src/creator.scss', './src/creator.html'],
	'player.css': ['./src/player.scss', './src/player.html'],
	'guides/player.temp.html': [ './src/_guides/player.md'],
	'guides/creator.temp.html': [ './src/_guides/creator.md']
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
	rules.loadAndPrefixCSS,
	rules.loadAndPrefixSASS,
	rules.loadHTMLAndReplaceMateriaScripts,
	rules.copyImages,
	rules.loadAndCompileMarkdown
]

// options for the build
let options = {
	copyList: newCopy,
	entries: entries,
	moduleRules: customRules
}

module.exports = widgetWebpack.getLegacyWidgetBuildConfig(options)

