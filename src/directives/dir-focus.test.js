describe('focusMe Directive', function() {
	require('angular/angular.js')
	require('angular-mocks/angular-mocks.js')

	var $scope
	var $compile
	var $timeout

	beforeEach(() => {
		jest.resetModules()

		// create the module
		const ThisOrThat = angular.module('ThisOrThatCreator', [])
		// make angular mock work with the module
		angular.mock.module('ThisOrThatCreator')
		// load up our directive
		const { DirectiveFocus } = require('./dir-focus')
		ThisOrThat.directive('focusMe', DirectiveFocus)

		// initialize the angualr controller
		inject(function(_$compile_, _$controller_, _$timeout_, _$rootScope_) {
			$timeout = _$timeout_
			$compile = _$compile_
			$scope = _$rootScope_.$new()
		})
	})

	it('should focus given elements when appropriate', function() {
		$scope.activate = false

		const element = $compile(angular.element('<div focus-me="activate"></div>'))($scope)
		$scope.$digest()

		jest.spyOn(element[0], 'focus')
		$scope.activate = true
		$scope.$digest()
		$timeout.flush()

		//make sure the element was given focus
		expect(element[0].focus).toHaveBeenCalled()
	})
})
