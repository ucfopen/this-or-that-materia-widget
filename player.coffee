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
		selected: false
		transition: false

	# the stage hands
	$scope.hands =
		thisRaised: false
		thatRaised: false

	#for preloading
	$scope.images = []

	_qset = null

	$scope.launchGame = ->
		$scope.gameState.ingame = true

	$scope.endGame = ->
		Materia.Engine.end false

	$scope.viewScores = ->
		Materia.Engine.end true

	$scope.start = (instance, qset, version) ->
		_qset = qset

		for item in _qset.items
			for answer in item.answers
				$scope.images.push Materia.Engine.getImageAssetUrl answer.options.asset.id

		_incrementQuestion()

	$scope.checkChoice = (value) ->
		#get the id, value, and text of the chosen answer
		_id    = _qset.items[$scope.questions.current].id
		_value = _qset.items[$scope.questions.current].answers[value].value
		_ans   = _qset.items[$scope.questions.current].answers[value].text
		#track which image the user selected in the game
		$scope.questions.choice = value

		switch _value
			when 0 then $scope.questions.correct[value] = 0
			when 100 then $scope.questions.correct[value] = 1

		Materia.Score.submitQuestionForScoring _id, _ans

		$scope.questions.selected = true
		$scope.gameState.showNext = true

	$scope.nextClicked = ->
		$scope.gameState.showNext = false
		$scope.questions.correct = [-1,-1]
		$scope.questions.choice = -1
		$scope.questions.transition = true

		$timeout _incrementQuestion, 1000

	_incrementQuestion = ->
		$scope.questions.current++

		if _qset.items[$scope.questions.current]
			$scope.title = _qset.items[$scope.questions.current].questions[0].text
			$scope.answers = _randomizeChoices _qset.items[$scope.questions.current].answers

			for answer in $scope.answers
				answer.image = Materia.Engine.getImageAssetUrl answer.options.asset.id

			$scope.questions.selected   = false
			$scope.questions.transition = false
		else
			$scope.gameState.ingame  = false
			$scope.gameState.endgame = true
			$scope.endGame()

	_randomizeChoices = (array) ->
		i = array.length

		if i == 0 then return false

		while --i
			j = Math.floor(Math.random() * (i + 1))
			tempi = array[i]
			tempj = array[j]
			array[i] = tempj
			array[j] = tempi

		return array

	Materia.Engine.start($scope)
]
