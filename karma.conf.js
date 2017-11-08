module.exports = function(config) {
	config.set({

		basePath: './',

		browsers: ['PhantomJS'],

		files: [
			'node_modules/angular/angular.js',
            'node_modules/angular-mocks/angular-mocks.js',
            'node_modules/angular-sanitize/angular-sanitize.js',
			'node_modules/angular-animate/angular-animate.js',
            'node_modules/jquery/dist/jquery.js',
			'node_modules/materia-client-assets/dist/js/materia.js',
			'node_modules/materia-client-assets/dist/js/student.js',
            'node_modules/materia-client-assets/dist/js/author.js',
            'build/assets/js/hammer.min.js',
            'build/assets/js/*.js',
			'build/demo.json',
			'build/*.js',
			'tests/*.coffee'
		],

		frameworks: ['jasmine'],

		plugins: [
			'karma-coverage',
			'karma-eslint',
			'karma-jasmine',
            'karma-json-fixtures-preprocessor',
            'karma-coffee-preprocessor',
            'karma-coffeelint',
			'karma-mocha-reporter',
			'karma-phantomjs-launcher'
        ],
        
        coffeePreprocessor: {
            options: {
                sourceMap: true
            }
        },

        jsonFixturesPreprocessor: {
			variableName: '__demo__'
		},

		preprocessors: {
            'build/*.js': ['coverage', 'eslint'],
            'src/*.coffee': ['coffee'],
            'tests/*.coffee': 'coffee',
			'build/demo.json': ['json_fixtures']
		},

        //plugin-specific configurations
		eslint: {
			stopOnError: true,
			stopOnWarning: false,
			showWarnings: true,
			engine: {
				configFile: '.eslintrc.json'
			}
		},

		reporters: ['coverage', 'mocha'],

		//reporter-specific configurations

		coverageReporter: {
			check: {
				global: {
					statements: 100,
					branches:   80,
					functions:  90,
					lines:      90
				},
				each: {
					statements: 100,
					branches:   80,
					functions:  90,
					lines:      90
				}
			},
			reporters: [
				{ type: 'html', subdir: 'report-html' },
				{ type: 'cobertura', subdir: '.', file: 'coverage.xml' }
			]
		},

		mochaReporter: {
			output: 'autowatch'
		}

	});
};
