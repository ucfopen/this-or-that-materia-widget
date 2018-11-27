ThisOrThat = angular.module 'ThisOrThatCreator'

ThisOrThat.directive 'focusMe', ($timeout, $parse) ->
	link: (scope, element, attrs) ->
		model = $parse(attrs.focusMe)
		scope.$watch model, (value) ->
			if value
				$timeout ->
					element[0].focus()
			value