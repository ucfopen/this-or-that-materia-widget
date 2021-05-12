// const { DirectiveEnter } = require('./directives/dir-enter')
// const { DirectiveFocus } = require('./directives/dir-focus')
// const { CreatorService } = require('./services/srv-creator')
// const { ControllerThisOrThatCreator } = require('./controllers/ctl-creator')
const { ControllerThisOrThatScorescreen } = require('./controllers/ctl-scoreScreen')

const ThisOrThat = angular.module('ThisOrThatScorescreen', [])
ThisOrThat.controller('ThisOrThatScoreCtrl', [
	'$scope',
	'$sce',
	ControllerThisOrThatScorescreen
])
