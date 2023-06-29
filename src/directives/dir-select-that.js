export const DirectiveSelectThat = () => (scope, element, attrs) => {
	element.bind('keydown keypress', event => {
		if (event.key == 'e' || event.key == 'E') {
			scope.$apply(() => scope.$eval(attrs.ngSelectThat))
			event.preventDefault()
		}
	})
}
