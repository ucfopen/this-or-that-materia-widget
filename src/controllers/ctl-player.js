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

			if (ans.options.asset.type) {
				switch (ans.options.asset.type) {
					case 'image':
					case 'audio':
						ans.options.asset.value = Materia.Engine.getMediaUrl(ans.options.asset.id)
						break
					case 'video':
						ans.options.asset.value = $sce.trustAsResourceUrl(ans.options.asset.value)
						break
				}
			}
			else { // old qsets do not have an asset type
				ans.options.asset.value = Materia.Engine.getMediaUrl(ans.options.asset.id)
				ans.options.asset.type = 'image'
			}

			answers.push({
				type: ans.options.asset.type,
				value: ans.options.asset.value
			})
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
	$scope.question.current++
	const curItem = _qset.items[$scope.question.current]
	if (curItem) {
		$scope.title = curItem.questions[0].text
		$scope.answers = shuffleArray(curItem.answers)

		$scope.question.selected = false
		$scope.question.transition = false
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
	// value is 0 or 1
	//get the id, value, and text of the chosen answer
	const curItem = _qset.items[$scope.question.current]
	const curAnswer = curItem.answers[value]
	const _feedback = curItem.options.feedback
	//track which image the user selected in the game
	$scope.question.choice = value

	switch (curAnswer.value) {
		case 0:
			$scope.question.correct[value] = 'Incorrect'
			$scope.question.feedback[value] = curItem.options.feedback || ''
			break

		case 100:
			$scope.question.correct[value] = 'Correct!'
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

	$scope.question.selected = true
	$scope.gameState.showNext = true
}

export const nextClicked = ($scope, $timeout) => {
	$scope.gameState.showNext = false
	$scope.question.correct = ['', '']
	$scope.question.feedback = ['', '']
	$scope.question.choice = -1
	$scope.question.transition = true
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

	$scope.question = {
		choice: -1,
		current: -1,
		correct: ['',''],
		feedback: ['',''],
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
