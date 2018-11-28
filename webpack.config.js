const path = require('path')
const srcPath = path.join(__dirname, 'src') + path.sep
const outputPath = path.join(process.cwd(), 'build')

// load the reusable legacy webpack config from materia-widget-dev
const widgetWebpack = require('materia-widget-development-kit/webpack-widget')
const rules = widgetWebpack.getDefaultRules()
const entries = widgetWebpack.getDefaultEntries()
const copy = widgetWebpack.getDefaultCopyList()

const newCopy = [
	...copy,
	{
		from: path.join(__dirname, 'node_modules', 'hammerjs', 'dist', 'hammer.min.js'),
		to: path.join(outputPath, 'assets', 'js', 'hammer.min.js'),
	}
]

entries['creator.js'] = [
	srcPath + 'modules/creator.coffee',
	srcPath + 'directives/enter.coffee',
	srcPath + 'directives/focus.coffee',
	srcPath + 'creator.coffee'
]

/*
replace the default loaderCompileCoffee with one that protects
short style ng function definitions
*/
const customCoffeeLoader = {
	test: /\.coffee$/i,
	exclude: /node_modules/,
	loader: require('extract-text-webpack-plugin').extract({
		use: ['raw-loader', 'ng-annotate-loader', 'coffee-loader']
	})
}

const customRules = [
	rules.loaderDoNothingToJs,
	customCoffeeLoader, // <--- replaces "rules.loaderCompileCoffee"
	rules.copyImages,
	rules.loadHTMLAndReplaceMateriaScripts,
	rules.loadAndPrefixCSS,
	rules.loadAndPrefixSASS
]

// options for the build
let options = {
	copyList: newCopy,
	entries: entries,
	moduleRules: customRules
}

module.exports = widgetWebpack.getLegacyWidgetBuildConfig(options)
