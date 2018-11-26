const path = require('path')

// load the reusable legacy webpack config from materia-widget-dev
const widgetWebpack = require('materia-widget-development-kit/webpack-widget')
const rules = widgetWebpack.getDefaultRules()

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
	moduleRules: customRules
}

module.exports = widgetWebpack.getLegacyWidgetBuildConfig(options)
