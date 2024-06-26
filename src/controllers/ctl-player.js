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

			// old qsets do not have feedback inside answers
			if (!ans.options.feedback)
			{
				ans.options.feedback = '';
			}
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

	// if question bank is enabled, slice the qset to the length specified in the qset options
	if(_qset.options && _qset.options.enableQuestionBank === true) {

		// don't shuffle if the qset's been shuffled already
		if(_qset.options.randomizeOrder === true) {
			let qbItemsLength = qset.options.questionBankVal
			let rndStart = Math.floor(Math.random() * (_qset.items.length - qbItemsLength + 1))
			_qset.items = _qset.items.slice(rndStart, rndStart + qbItemsLength)
		}
		else {
			shuffleArray(_qset.items)
			let qbItemsLength = qset.options.questionBankVal
			let rndStart = Math.floor(Math.random() * (_qset.items.length - qbItemsLength + 1))
			_qset.items = _qset.items.slice(rndStart, rndStart + qbItemsLength)
		}
	}

	$scope.choices = getAllAnswerChoices($sce, _qset)
	$scope.questionCount = _qset.items.length

	if ($scope.questionCount > 0)
		$scope.questionsRemainingText = ($scope.questionCount - $scope.question.current - 1) + " questions remaining. Now on question " + ($scope.question.current + 2) + " of " + $scope.questionCount + ": " + _qset.items[$scope.question.current + 1].questions[0].text

	showNextQuestion($scope)
}

export const showNextQuestion = $scope => {
	$scope.focusStatusButton = false

	$scope.question.current++
	const curItem = _qset.items[$scope.question.current]
	if (curItem) {
		$scope.title = curItem.questions[0].text
		$scope.answers = shuffleArray(curItem.answers)

		$scope.question.selected = false
		$scope.question.transition = false
		$scope.selectedChoice = -1
	} else {
		endGame($scope)
	}
}

export const endGame = $scope => {
	$scope.gameState.ingame = false
	$scope.gameState.endgame = true
	$scope.gameState.splashText = 'The End'
	Materia.Engine.end(false)
	$scope.title = ''
	$scope.continueToScores = true
	$scope.$apply()
}

export const viewScores = () => {
	Materia.Engine.end(true)
}

export const checkChoice = ($scope, value) => {
	if ($scope.question.selected)
		return;

	// value is 0 or 1
	//get the id, value, and text of the chosen answer
	const curItem = _qset.items[$scope.question.current]
	const curAnswer = curItem.answers[value]
	const _feedback = curAnswer.options.feedback;
	//track which image the user selected in the game
	$scope.question.choice = value

	switch (curAnswer.value) {
		case 0:
			$scope.question.correct[value] = 'Incorrect'
			$scope.answers[value].options.feedback = _feedback || (curItem.options && curItem.options.feedback ? curItem.options.feedback : '')
			$scope.assistiveAlert("Your selection was incorrect. " + _feedback)
			break

		case 100:
			$scope.question.correct[value] = 'Correct!'
			$scope.answers[value].options.feedback = _feedback || ''
			$scope.assistiveAlert("Your selection was correct. " + _feedback)
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
	// update the questions remaining status aria-label
	if ($scope.question.current + 1 < $scope.questionCount) {
		let questionsRemaining = ($scope.questionCount - $scope.question.current - 1)
		$scope.questionsRemainingText = questionsRemaining + " question" + (questionsRemaining > 1 ? "s" : "") + "  remaining. Now on question " + ($scope.question.current + 2) + " of " + $scope.questionCount + ": " + _qset.items[$scope.question.current + 1].questions[0].text
		$scope.focusStatusButton = true
	} else {
		$scope.questionsRemainingText = 'No questions remaining.'
		$scope.focusStatusButton = false
	}

	$scope.gameState.showNext = false
	$scope.question.correct = ['', '']
	$scope.answers[0].options.feedback = ''
	$scope.answers[1].options.feedback = ''
	$scope.question.choice = -1
	$scope.question.transition = true
	$scope.hands.thisRaised = false
	$scope.hands.thatRaised = false

	$timeout(showNextQuestion.bind(null, $scope), 1200)
}

export const closeIntro = ($scope, $timeout) => {
	$scope.gameState.ingame = true
	// make splash modal aria-hidden and focus status indicator
	$scope.focusStatusButton = true
	$timeout(() => {
		$scope.assistiveAlert("Question " + ($scope.question.current + 1) + " of " + $scope.questionCount + ": " + _qset.items[$scope.question.current].questions[0].text)
		// set this to false so we can trigger it in nextClicked
		$scope.focusStatusButton = false
	}, 1200)
}

export const toggleInstructions = ($scope, $timeout) => {
	$scope.instructionsOpen = !$scope.instructionsOpen

	if (!$scope.instructionsOpen && $scope.prevFocus) {
		$timeout(() => {
			$scope.prevFocus.focus()
			$scope.prevFocus = null
		}, true)
	}
}

export const ControllerThisOrThatPlayer = function($scope, $timeout, $sce) {
	$scope.gameState = {
		ingame: false,
		endgame: false,
		score: 0,
		showNext: false,
		splashText: "This or That"
	}

	$scope.question = {
		choice: -1,
		current: -1,
		correct: ['',''],
		selected: false,
		transition: false
	}

	$scope.questionCount = 0
	$scope.questionsRemainingText = ''

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
	$scope.closeIntro = closeIntro.bind(null, $scope, $timeout)
	$scope.toggleInstructions = toggleInstructions.bind(null, $scope, $timeout)
	$scope.instructionsOpen = false
	$scope.selectedChoice = -1

	$scope.lightboxTarget = -1
	$scope.focusThisExpand = false
	$scope.focusThatExpand = false
	$scope.focusStatusButton = false

	$scope.pressedQOnce = false
	$scope.prevFocus = null

	// Opens or closes the image lightbox
	// Values of val:
	// ---- 0  : open image for "this" option
	// ---- 1  : open image for "that" option
	// ---- -1 : close image
	$scope.setLightboxTarget = (val) => {
		// Open the lightbox
		if (val == 0 || val == 1)
		{
			$scope.assistiveAlert("Viewing image.")
			$scope.lightboxTarget = val
		}
		// Close the lightbox
		else
		{
			$scope.assistiveAlert("Closed image viewer.")
			// If image for "this" option is currently open, focus "this" option's expand image button
			if ($scope.lightboxTarget == 0)
			{
				$scope.focusThisExpand = true
				setTimeout(() => {
					$scope.focusThisExpand = false
				}, 1000)
			}
			// Else focus "that" option's expand image button
			else if ($scope.lightboxTarget == 1)
			{
				$scope.focusThatExpand = true
				setTimeout(() => {
					$scope.focusThatExpand = false
				}, 1000)
			}
			$scope.lightboxTarget = -1
		}
	}

	$scope.lightboxZoom = 0

	$scope.setLightboxZoom = (val) => {
		$scope.lightboxZoom = val
	}

	$scope.selectChoice = (event) => {
		if ($scope.gameState.ingame)
		{
			// Focus this
			if (event.key == 'a' || event.key == 'A') {
				$scope.selectedChoice = 0;
			}
			// Focus that
			else if (event.key == 'd' || event.key == 'D') {
				$scope.selectedChoice = 1;
			}
			// Read question info, have two descriptions that are identical except for two colons in second one
			// so that screenreader detects a change in the aria-live region
			else if (event.key == 'q' || event.key == 'Q') {
				if (!$scope.pressedQOnce)
				{
					$scope.assistiveAlert("Question " + ($scope.question.current + 1) + " of " + $scope.questionCount + ": " + _qset.items[$scope.question.current].questions[0].text)
					$scope.pressedQOnce = true
				}
				else {
					$scope.assistiveAlert("Question " + ($scope.question.current + 1) + " of " + $scope.questionCount + ":: " + _qset.items[$scope.question.current].questions[0].text)
					$scope.pressedQOnce = false
				}
			} else if (event.key == 'H' || event.key == 'h') {
				if (!$scope.instructionsOpen) {
					$scope.prevFocus = event.target
				}
				toggleInstructions($scope, $timeout);
			}
		} else if (event.key == 'H' || event.key == 'h') {
			if (!$scope.instructionsOpen) {
				$scope.prevFocus = event.target
			}
			toggleInstructions($scope, $timeout);
		}
	}

	$scope.getAdjustedTextSize = (text) => {
		if (text.length < 140) return 26
		else {
			let offset = text.length - 80
			let scaleFactor = offset / 4 // adjust this value to increase or decrease the rate of text scaling

			return (28 - Math.ceil(scaleFactor)) > 15 ? 28 - Math.ceil(scaleFactor) : 15
		}
	}

	// helper function to update the aria-live status region
	// angular binding does not cooperate well with aria-live, so we update the DOM element directly instead
	$scope.assistiveAlert = (alert) => {
		document.getElementById('assistive-alert').innerText = alert
	}

	Materia.Engine.start({ start: onMateriaStart.bind(null, $scope, $sce) })
}
