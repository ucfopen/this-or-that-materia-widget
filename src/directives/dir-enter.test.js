describe('ngEnter Directive', () => {
	require('angular/angular.js')
	require('angular-mocks/angular-mocks.js')

	let $scope
	let $compile
	let $timeout
	let element

	beforeEach(() => {
		jest.resetModules()

		// create the module
		const ThisOrThat = angular.module('ThisOrThatCreator', [])
		// make angular mock work with the module
		angular.mock.module('ThisOrThatCreator')
		// load up our directive
		const { DirectiveEnter } = require('./dir-enter')
		ThisOrThat.directive('ngEnter', DirectiveEnter)

		// grab references to angular variables
		inject((_$compile_, _$controller_, _$timeout_, _$rootScope_) => {
			$timeout = _$timeout_
			$compile = _$compile_
			$scope = _$rootScope_.$new()
		})

		element = $compile(angular.element('<input ng-enter/>'))($scope)
		$scope.$digest()
	})

	function keyPress(code) {
		const e = document.createEvent('Events')
		e.initEvent('keydown', true, false)
		e.which = code
		return e
	}

	it('should allow non-enter keypresses to function normally', () => {
		//test with the 'a' key
		const e = keyPress(65)
		spyOn(e, 'preventDefault')
		element.triggerHandler(e)
		expect(e.preventDefault).not.toHaveBeenCalled()

		//test with the 'backspace' key
		e.which = 8
		element.triggerHandler(e)
		expect(e.preventDefault).not.toHaveBeenCalled()
	})

	it('should prevent default behavior when the enter key is pressed', () => {
		//spoof pressing the 'Enter' key on the input element
		const e = keyPress(13)
		spyOn(e, 'preventDefault')
		element.triggerHandler(e)
		expect(e.preventDefault).toHaveBeenCalled()
	})
})
