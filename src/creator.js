const { DirectiveEnter } = require('./directives/dir-enter')
const { DirectiveFocus } = require('./directives/dir-focus')
const { CreatorService } = require('./services/srv-creator')
const { ControllerThisOrThatCreator } = require('./controllers/ctl-creator')
const angularDragula = require('angularjs-dragula');

// Create an angular module to import the animation module and house our controller
const ThisOrThat = angular.module('ThisOrThatCreator', [angularDragula(angular), 'ngAnimate', 'ngSanitize'])
ThisOrThat.directive('ngEnter', DirectiveEnter)
ThisOrThat.directive('focusMe', DirectiveFocus)
ThisOrThat.factory('CreatorService', ['$sanitize', CreatorService])
ThisOrThat.controller('ThisOrThatCreatorCtrl', [
	'$scope',
	'$timeout',
	'$sanitize',
	'CreatorService',
	'dragulaService',
	ControllerThisOrThatCreator
])
