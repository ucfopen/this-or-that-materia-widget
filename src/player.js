const { ControllerThisOrThatPlayer } = require('./controllers/ctl-player')

const ThisOrThatEngine = angular.module('ThisOrThatEngine', ['ngAnimate', 'hammer', 'ngSanitize'])
ThisOrThatEngine.controller('ThisOrThatEngineCtrl', [
	'$scope',
	'$timeout',
	'$sce',
	ControllerThisOrThatPlayer
])
