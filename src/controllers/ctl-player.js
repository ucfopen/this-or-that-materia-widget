let _qset

// fisher-yates shuffle algorithm
export const shuffleArray = array => {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1))
		const x = array[i]
		array[i] = array[j]
		array[j] = x
	}

	return array
}

export const getAllAnswerChoices = ($sce, _qset) => {
	console.log("qset:")
	console.log(_qset)
	const answers = []
	_qset.items.forEach(item => {
		if (!item.answers) return
		item.answers.forEach((ans, i) => {

			let response = ''

			if (ans.value == 100) { // correct answer
				switch (ans.options.asset.type) {
					case 'image':
					case 'audio':
						ans.options.value = Materia.Engine.getMediaUrl(ans.options.asset.id)
						break
					case 'text':
						// do nothing?
					case 'video':

				}
			}


			// if (item.options.answerType[i] === 'image' || item.options.answerType[i] === 'audio') {
			// 	ans.options.asset.answerChoice = [Materia.Engine.getMediaUrl(ans.options.asset.id)]
			// } else if (item.options.answerType[i] === 'text') {
			// 	ans.options.asset.answerChoice = [ans.options.asset.id]
			// } else {
			// 	ans.options.asset.answerChoice = [$sce.trustAsResourceUrl(ans.options.asset.id)]
			// }
			// ans.options.asset.answerChoice[1] = item.options.answerType[i]
			// answers.push(ans.options.asset.answerChoice)
		})
	})

	return answers
}

export const onMateriaStart = ($scope, $sce, instance, qset, version) => {
	_qset = qset
	_qset.version = version

	if (_qset.options && _qset.options.randomizeOrder === true) {
		shuffleArray(_qset.items)
	}

	$scope.choices = getAllAnswerChoices($sce, _qset)

	showNextQuestion($scope)
}

export const showNextQuestion = $scope => {
	$scope.questions.current++
	const curItem = _qset.items[$scope.questions.current]
	if (curItem) {
		$scope.title = curItem.questions[0].text
		$scope.answers = shuffleArray(curItem.answers)

		$scope.questions.selected = false
		$scope.questions.transition = false
	} else {
		endGame($scope)
	}
}

export const endGame = $scope => {
	$scope.gameState.ingame = false
	$scope.gameState.endgame = true
	Materia.Engine.end(false)
	$scope.title = ''
	$scope.$apply()
}

export const viewScores = () => {
	Materia.Engine.end(true)
}

export const checkChoice = ($scope, value) => {
	//get the id, value, and text of the chosen answer
	const curItem = _qset.items[$scope.questions.current]
	const curAnswer = curItem.answers[value]
	const _feedback = curItem.options.feedback
	//track which image the user selected in the game
	$scope.questions.choice = value

	switch (curAnswer.value) {
		case 0:
			$scope.questions.correct[value] = 'Incorrect'
			$scope.questions.feedback[value] = curItem.options.feedback || ''
			break

		case 100:
			$scope.questions.correct[value] = 'Correct!'
			break
	}

	switch (parseInt(_qset.version, 10)) {
		case 0:
		case 1:
		case NaN:
			// version 1 used answer text for checking answers
			Materia.Score.submitQuestionForScoring(curItem.id, curAnswer.text)
			break

		case 2:
		default:
			// version 2+ uses answer id for checking answers
			Materia.Score.submitQuestionForScoring(curItem.id, curAnswer.id, curAnswer.text)
	}

	$scope.questions.selected = true
	$scope.gameState.showNext = true
}

export const nextClicked = ($scope, $timeout) => {
	$scope.gameState.showNext = false
	$scope.questions.correct = ['', '']
	$scope.questions.feedback = ['', '']
	$scope.questions.choice = -1
	$scope.questions.transition = true
	$scope.hands.thisRaised = false
	$scope.hands.thatRaised = false

	$timeout(showNextQuestion.bind(null, $scope), 1000)
}

export const closeIntro = $scope => {
	$scope.gameState.ingame = true
}

export const ControllerThisOrThatPlayer = function($scope, $timeout, $sce) {
	$scope.gameState = {
		ingame: false,
		endgame: false,
		score: 0,
		showNext: false
	}

	$scope.questions = {
		choice: -1,
		current: -1,
		correct: ['', ''],
		feedback: ['', ''],
		selected: false,
		transition: false
	}

	// the stage hands
	$scope.hands = {
		thisRaised: false,
		thatRaised: false
	}

	//for preloading
	$scope.title = ''
	$scope.answers = []
	$scope.choices = []
	$scope.viewScores = viewScores
	$scope.checkChoice = checkChoice.bind(null, $scope)
	$scope.nextClicked = nextClicked.bind(null, $scope, $timeout)
	$scope.closeIntro = closeIntro.bind(null, $scope)

	Materia.Engine.start({ start: onMateriaStart.bind(null, $scope, $sce) })
}
