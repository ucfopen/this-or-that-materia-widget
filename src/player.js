const { ControllerThisOrThatPlayer } = require('./controllers/ctl-player')
const { DirectiveSelectThis } = require('./directives/dir-select-this')
const { DirectiveFocus } = require('./directives/dir-focus')
const { DirectiveSelectThat } = require('./directives/dir-select-that')

const ThisOrThatEngine = angular.module('ThisOrThatEngine', ['ngAnimate', 'hammer', 'ngSanitize', 'ngAria'])

ThisOrThatEngine.directive('focusMe', DirectiveFocus)
ThisOrThatEngine.directive('ngSelectThis', DirectiveSelectThis)
ThisOrThatEngine.directive('ngSelectThat', DirectiveSelectThat)
ThisOrThatEngine.controller('ThisOrThatEngineCtrl', [
	'$scope',
	'$timeout',
	'$sce',
	ControllerThisOrThatPlayer
])
