###

Materia
It's a thing

Widget  : This or That, Engine
Authors : Eric Colon

###

ThisOrThatEngine = angular.module 'ThisOrThatEngine', ['ngAnimate', 'hammer']

ThisOrThatEngine.controller 'ThisOrThatEngineCtrl', ['$scope', '$timeout', ($scope, $timeout) ->
	$scope.inGame = false
	$scope.curQuestion = -1
	$scope.curAnswer = -1
	$scope.qset = []
	$scope.choice = -1
	$scope.correct = 
		this: null
		that: null
	# the stage hands
	$scope.hands =
		thisRaised: false
		thatRaised: false
	$scope.choiceSelected = false
	gameScore = 0

	$scope.launchGame = ->
		$scope.inGame = true

	$scope.endGame = ->
		Materia.Engine.end()

	$scope.start = (instance, qset, version) ->
		$scope.qset = qset
		incrementQuestion()

	$scope.checkChoice = (value) ->
		correctValue = $scope.qset.items[$scope.curQuestion].answers[$scope.curAnswer].correct
		$scope.choice = value
		switch value
			when 0
				if value == correctValue
					$scope.correct.this = true
					gameScore += 100
				else
					$scope.correct.this = false
			when 1
				if value == correctValue
					$scope.correct.that = true
					gameScore += 100
				else
					$scope.correct.that = false

		$scope.choiceSelected = true
		$scope.showNext = true

	$scope.incrementAnswer = ->
		$scope.curAnswer++

		$scope.showNext     = false
		$scope.correct.this = null
		$scope.correct.that = null
		$scope.choice = -1

		if $scope.qset.items[$scope.curQuestion].answers[$scope.curAnswer]
			$scope.answers = $scope.qset.items[$scope.curQuestion].answers[$scope.curAnswer].choices

			for answer in $scope.answers
				answer.image = Materia.Engine.getImageAssetUrl(answer.image)

			$scope.choiceSelected = false
		else
			$scope.curAnswer = -1
			incrementQuestion()

	incrementQuestion = ->
		$scope.curQuestion++

		if $scope.qset.items[$scope.curQuestion]
			$scope.question = $scope.qset.items[$scope.curQuestion].questions[0].text

			$scope.incrementAnswer()
		else
			$scope.inGame = false

	Materia.Engine.start($scope)
]
