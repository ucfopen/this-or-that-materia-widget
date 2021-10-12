const { ControllerThisOrThatScorescreen } = require('./controllers/ctl-scoreScreen')

const ThisOrThat = angular.module('ThisOrThatScorescreen', [])
ThisOrThat.controller('ThisOrThatScoreCtrl', [
	'$scope',
	'$sce',
	ControllerThisOrThatScorescreen
])
