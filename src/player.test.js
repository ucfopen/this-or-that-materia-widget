describe('Creator Controller', function() {
	require('angular/angular.js');
	require('angular-mocks/angular-mocks.js');
	var $controller

	beforeEach(() => {
		jest.resetModules()
		angular.mock.module('ThisOrThatEngine')
		angular.module('ngAnimate', [])
		angular.module('hammer', [])
		angular.module('ngSanitize', [])
		// mock materia
		global.Materia = {
			Engine: {
				start: jest.fn(),
				end: jest.fn(),
				setHeight: jest.fn()
			},
			Score: {
				submitQuestionForScoring: jest.fn()
			}
		}

		require('./player.coffee');

		// use angular mock to access angular modules
		inject(function(_$controller_) {
			$controller = _$controller_
		});
	})

	test('ThisOrThatEngineCtrl calls Engine.start', () => {
		var $scope = {}
		var controller = $controller('ThisOrThatEngineCtrl', { $scope })
		expect(global.Materia.Engine.start).toHaveBeenCalledTimes(1)
	});

})
