export const DirectiveSelectThis = () => (scope, element, attrs) => {
	element.bind('keydown keypress', event => {
		if (event.key == 'q' || event.key == 'Q') {
			scope.$apply(() => scope.$eval(attrs.ngSelectThis))
			event.preventDefault()
		}
	})
}
