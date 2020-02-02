const ThisOrThat = angular.module('ThisOrThatCreator');

ThisOrThat.directive('focusMe', ($timeout, $parse) => ({
	link(scope, element, attrs) {
		const model = $parse(attrs.focusMe);
		scope.$watch(model, function(value) {
			if (value) {
				$timeout(() => element[0].focus());
			}
		});
	}
}));
