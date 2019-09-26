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
	},
	{
		from: path.join(__dirname, 'src', '_guides', 'assets'),
		to: path.join(outputPath, 'guides', 'assets'),
		toType: 'dir'
	}
]

entries['creator.js'] = [
	srcPath + 'modules/creator.coffee',
	srcPath + 'directives/enter.coffee',
	srcPath + 'directives/focus.coffee',
	srcPath + 'creator.coffee'
]

entries['guides/creator.temp.html'] = [
	srcPath + '_guides/creator.md'
]
entries['guides/player.temp.html'] = [
	srcPath + '_guides/player.md'
]

const customRules = [
	rules.loaderDoNothingToJs,
	rules.loaderCompileCoffee,
	rules.copyImages,
	rules.loadHTMLAndReplaceMateriaScripts,
	rules.loadAndPrefixCSS,
	rules.loadAndPrefixSASS,
	rules.loadAndCompileMarkdown
]

// options for the build
let options = {
	copyList: newCopy,
	entries: entries,
	moduleRules: customRules
}

module.exports = widgetWebpack.getLegacyWidgetBuildConfig(options)
