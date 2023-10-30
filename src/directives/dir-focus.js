export const DirectiveFocus = ['$timeout', '$parse', ($timeout, $parse) => ({
	link(scope, element, attrs) {
		const model = $parse(attrs.focusMe)
		scope.$watch(model, function(value) {
			if (value) {
				$timeout(() => element[0].focus(), true)
			}
		})
	}
})]
