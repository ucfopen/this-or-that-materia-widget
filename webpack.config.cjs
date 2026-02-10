const path = require('path')
const webpackWidget = require('materia-widget-development-kit/webpack-widget')

const srcPath = path.join(__dirname, 'src') + path.sep
const rules = webpackWidget.getDefaultRules()

const entries = {
	'player': [
		path.join(srcPath, 'materia-init', 'player', 'player.html'),
		path.join(srcPath, 'materia-init', 'player', 'player.jsx'),
	],
	'creator': [
		path.join(srcPath, 'materia-init', 'creator', 'creator.html'),
		path.join(srcPath, 'materia-init', 'creator', 'creator.jsx'),
	],
	'scoreScreen': [
		path.join(srcPath, 'materia-init', 'score_screen', 'scoreScreen.html'),
		path.join(srcPath, 'materia-init', 'score_screen', 'scoreScreen.jsx'),
	]
}

const customReactLoader = {
	test: /\.(t|j)sx?$/,
	exclude: /node_modules/,
	use: {
		loader: 'babel-loader',
		options: {
			presets: ['@babel/preset-env', '@babel/preset-react', '@babel/preset-typescript'],
		}
	}
}

const cssLoader = {
	test: /\.css$/i,
	exclude: /node_modules/,
	sideEffects: true,
	use: [
		"style-loader",
		{
			loader: "css-loader",
			options: { esModule: false },
		},
		{
			loader: "postcss-loader",
			options: {
				postcssOptions: {
					plugins: ["postcss-nesting"]
				}
			}
		}
	]
}

const options = {
	entries: entries,
	copyList: [...webpackWidget.getDefaultCopyList()],
	moduleRules: [
		rules.loadHTMLAndReplaceMateriaScripts,
		rules.copyImages,
		customReactLoader,
		cssLoader,
	]
}

module.exports = {
	plugins: [],

	...webpackWidget.getLegacyWidgetBuildConfig(options),

	externals: {
		"react": "React",
		"react-dom": "ReactDOM"
	},

	resolve:  {
		extensions: ['.js', '.ts', '.jsx', '.tsx'],
	},
}
