const { ControllerThisOrThatPlayer } = require('./controllers/ctl-player')
const { DirectiveFocus } = require('./directives/dir-focus')

const ThisOrThatEngine = angular.module('ThisOrThatEngine', ['ngAnimate', 'hammer', 'ngSanitize', 'ngAria'])

ThisOrThatEngine.directive('focusMe', DirectiveFocus)
ThisOrThatEngine.controller('ThisOrThatEngineCtrl', [
	'$scope',
	'$timeout',
	'$sce',
	ControllerThisOrThatPlayer
])
