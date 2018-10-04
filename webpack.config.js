//override the demo with a copy that assigns ids to each question for dev purposes
let configOptions = {}
if (process.env.npm_lifecycle_script == 'webpack-dev-server') {
	configOptions.demoPath = 'devmateria_demo.json'
}
module.exports = require('materia-widget-development-kit/webpack-widget').getLegacyWidgetBuildConfig(configOptions)
