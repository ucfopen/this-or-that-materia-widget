ThisOrThatEngine = angular.module 'ThisOrThatEngine', ['ngAnimate', 'hammer', 'ngSanitize']

ThisOrThatEngine.controller 'ThisOrThatEngineCtrl', ['$scope','$timeout',($scope, $timeout) ->
	$scope.gameState =
		ingame: false
		endgame: false
		score: 0
		showNext: false

	$scope.questions =
		choice: -1
		current: -1
		correct: ['','']
		feedback: ['','']
		selected: false
		transition: false

	# the stage hands
	$scope.hands =
		thisRaised: false
		thatRaised: false

	#for preloading
	$scope.images = []

	_qset = null

	materiaCallbacks = {}

	materiaCallbacks.start = (instance, qset, version) ->
		_qset = qset
		_qset.version = version
		if qset.options? and qset.options.randomizeOrder == true
			_shuffle _qset.items

		for item in _qset.items
			for answer in item.answers
				$scope.images.push Materia.Engine.getImageAssetUrl answer.options.asset.id

		_incrementQuestion()

	$scope.endGame = ->
		$scope.gameState.ingame  = false
		$scope.gameState.endgame = true
		Materia.Engine.end false

	$scope.viewScores = ->
		Materia.Engine.end true

	_shuffle = (arr) ->
		i = arr.length
		return arr unless i > 0

		while --i
			j = Math.floor(Math.random() * (i+1))
			[arr[i], arr[j]] = [arr[j], arr[i]]

	$scope.checkChoice = (value) ->
		#get the id, value, and text of the chosen answer
		_id       = _qset.items[$scope.questions.current].id
		_value    = _qset.items[$scope.questions.current].answers[value].value
		_ans      = _qset.items[$scope.questions.current].answers[value].text
		_ansId    = _qset.items[$scope.questions.current].answers[value].id
		_feedback = _qset.items[$scope.questions.current].options.feedback
		#track which image the user selected in the game
		$scope.questions.choice = value

		switch _value
			when 0
				$scope.questions.correct[value] = 'Incorrect'
				if _feedback == undefined
					$scope.questions.feedback[value] = ''
				else
					$scope.questions.feedback[value] = _feedback

			when 100
				$scope.questions.correct[value] = 'Correct!'

		switch parseInt(_qset.version, 10)
			when 0, 1, NaN
				# version 1 used answer text for checking answers
				Materia.Score.submitQuestionForScoring _id, _ans
			else
				# version 2+ uses answer id for checking answers
				Materia.Score.submitQuestionForScoring _id, _ansId, _ans

		$scope.questions.selected = true
		$scope.gameState.showNext = true

	$scope.nextClicked = ->
		$scope.gameState.showNext   = false
		$scope.questions.correct    = ['','']
		$scope.questions.feedback   = ['','']
		$scope.questions.choice     = -1
		$scope.questions.transition = true
		$scope.hands.thisRaised     = false
		$scope.hands.thatRaised     = false

		$timeout _incrementQuestion, 1000

	$scope.closeIntro = ->
		$scope.gameState.ingame = true

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
			$scope.endGame()
			$timeout ->
				$scope.title = ""
				$scope.$apply()
			, 400


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

	Materia.Engine.start(materiaCallbacks)

]
