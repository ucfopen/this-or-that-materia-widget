module.exports = (config) ->
  config.set

    autoWatch: false

    singleRun: true

    basePath: './'

    browsers: [ 'PhantomJS' ]

    files: [
      '../../js/*.js'
      'node_modules/angular/angular.js'
      'node_modules/angular-mocks/angular-mocks.js'
      'node_modules/angular-sanitize/angular-sanitize.js'
      'node_modules/angular-animate/angular-animate.js'
      'src/*.coffee'
      'tests/*.coffee'
    ]

    frameworks: [ 'jasmine' ]

    plugins: [
      'karma-coverage'
      'karma-jasmine'
      'karma-coffee-preprocessor'
      'karma-phantomjs-launcher'
      'karma-mocha-reporter'
    ]

    coffeePreprocessor:
      options:
        sourceMap: true

    preprocessors:
      'src/*.coffee': 'coffee',
      'tests/*.coffee': 'coffee'

    reporters: [
      'coverage'
      'mocha'
    ]

    coverageReporter:
      check:
        global:
          statements: 90
          branches: 90
          functions: 90
          lines: 90
        each:
          statements: 90
          branches: 90
          functions: 90
          lines: 90
      reporters:
        [
          {
            type: 'cobertura'
            subdir: '.'
            file: 'coverage.xml'
          }
        ]
      instrumenters: ibrik: require('ibrik')
      instrumenter:
        '**/src/*.coffee': 'ibrik'
        '**/tests/*.coffee': 'ibrik'

    mochaReporter:
      output: 'autowatch'