###

Materia
It's a thing

Widget  : This or That, Engine
Authors : Eric Colon

###

ThisOrThatEngine = angular.module 'ThisOrThatEngine', ['ngAnimate', 'hammer']

ThisOrThatEngine.controller 'ThisOrThatEngineCtrl', ['$scope', '$timeout', ($scope, $timeout) ->
	$scope.gameState =
		ingame: false
		endgame: false
		score: 0
		showNext: false

	$scope.questions =
		choice: -1
		current: -1
		correct: [-1,-1]
		qset: {}
		selected: false
		transition: false

	# the stage hands
	$scope.hands =
		thisRaised: false
		thatRaised: false

	$scope.launchGame = ->
		$scope.gameState.ingame = true

	$scope.endGame = ->
		$scope.gameState.ingame  = false
		$scope.gameState.endgame = true

	$scope.viewScores = ->
		Materia.Engine.end()

	$scope.start = (instance, qset, version) ->
		$scope.questions.qset = qset
		incrementQuestion()

	$scope.checkChoice = (value) ->
		correctValue            = $scope.questions.qset.items[$scope.questions.current].answers.value
		$scope.questions.choice = value

		switch value
			when 0
				if value is correctValue
					$scope.questions.correct[0] = 1
					$scope.gameState.score += 100
				else
					$scope.questions.correct[0] = 0
			when 1
				if value is correctValue
					$scope.questions.correct[1] = 1
					$scope.gameState.score += 100
				else
					$scope.questions.correct[1] = 0

		$scope.questions.selected = true
		$scope.gameState.showNext = true

	$scope.nextClicked = ->
		$scope.gameState.showNext   = false
		$scope.questions.correct    = [-1,-1]
		$scope.questions.choice     = -1
		$scope.questions.transition = true

		$timeout(incrementQuestion, 1000)

	incrementQuestion = ->
		$scope.questions.current++

		if $scope.questions.qset.items[$scope.questions.current]
			$scope.question = $scope.questions.qset.items[$scope.questions.current].questions.text
			$scope.answers  = $scope.questions.qset.items[$scope.questions.current].answers.options

			for answer in $scope.answers
				answer.image = Materia.Engine.getImageAssetUrl(answer.image)

			$scope.questions.selected   = false
			$scope.questions.transition = false
		else
			$scope.endGame()

	Materia.Engine.start($scope)
]
