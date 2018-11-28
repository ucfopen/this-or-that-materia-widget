const path = require('path')
const srcPath = path.join(__dirname, 'src') + path.sep

// load the reusable legacy webpack config from materia-widget-dev
const widgetWebpack = require('materia-widget-development-kit/webpack-widget')
const rules = widgetWebpack.getDefaultRules()
const entries = widgetWebpack.getDefaultEntries()

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
	entries: entries,
	moduleRules: customRules
}

module.exports = widgetWebpack.getLegacyWidgetBuildConfig(options)
