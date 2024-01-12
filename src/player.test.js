// @TODO: the anuglar modules like 'player' have
// been re-factored to make unit testing easier
// these tests still lag behind those changes
// requiring them to mock all of angular, making
// them quite a bit more complicated, and 'higher'
// up in the unit -> functional testing ladder
// in general we should continue to push toward more

const ctlPlayer = require('./controllers/ctl-player');

// direct unit tests as this project continues to evolve
describe('Player Controller', function() {
	require('angular/angular.js')
	require('angular-mocks/angular-mocks.js')
	require('angular-aria/angular-aria.js')

	let $scope
	let $controller
	let $timeout
	let widgetInfo
	let qset
	let publicMethods

	//convenience function to quickly answer a question and click 'next'
	function quickSelect() {
		$scope.answers[0].value = 100
		$scope.checkChoice(0)
		$scope.nextClicked()
	}

	//convenience function to quickly answer a question and submit it for scoring with old qset versions
	function quickCheck() {
		$scope.answers[0].value = 0
		$scope.checkChoice(0)

		const expectedId = qset.data.items[0].id
		const expectedAnswer = $scope.answers[0].text
		expect(Materia.Score.submitQuestionForScoring).toHaveBeenCalledWith(expectedId, expectedAnswer)
	}

	beforeEach(() => {
		jest.resetModules()

		// mock materia
		global.Materia = {
			Engine: {
				start: jest.fn(methods => {
					publicMethods = methods
				}),
				end: jest.fn(),
				setHeight: jest.fn(),
				getMediaUrl: jest.fn(asset => {
					const cleaned = asset.replace(/<%MEDIA='(.+?)'%>/g, '$1')
					return 'MEDIA_URL/' + cleaned
				})
			},
			Score: {
				submitQuestionForScoring: jest.fn()
			}
		}

		// load qset
		widgetInfo = require('./demo.json')
		qset = widgetInfo.qset

		require('./player')
		// load the required code
		angular.mock.module('ThisOrThatEngine')
		angular.module('ngAnimate', [])
		angular.module('hammer', [])
		angular.module('ngSanitize', [])

		// mock scope
		$scope = {
			$apply: jest.fn()
		}

		// use angular mock to access angular modules
		inject(function(_$controller_, _$timeout_) {
			$timeout = _$timeout_
			// instantiate the controller
			$controller = _$controller_('ThisOrThatEngineCtrl', { $scope: $scope })
		})
	})

	test('controller provides the correct public methods to Engine.start', () => {
		expect(global.Materia.Engine.start).toHaveBeenCalledTimes(1)
		expect(Object.keys(publicMethods)).toEqual(['start'])
	})

	test('controller contains the expected images after starting', () => {
		publicMethods.start(widgetInfo, qset.data)
		const expectedImages = [
			'the_fall_of_phaeton.jpg',
			'mona_lisa.jpg',
			'mario.jpg',
			'wow.jpg',
			'chance.jpg',
			'bogart.jpg',
			'birds.mp3',
		]
		const answerArray = [];
		$scope.choices.forEach(answer => {
			answerArray.push(answer.value);
		})
		for (const index in expectedImages) {
			const fullName = 'MEDIA_URL/assets/img/demo/' + expectedImages[index]
			expect(answerArray).toContain(fullName)
		}
	})

	test('controller selects the first question after starting', () => {
		publicMethods.start(widgetInfo, qset.data)

		expect($scope.question.current).toEqual(0)
		expect($scope.title).toEqual(qset.data.items[0].questions[0].text)
		expect($scope.answers).toEqual(qset.data.items[0].answers)
		expect($scope.question.selected).toEqual(false)
		expect($scope.question.transition).toEqual(false)
	})

	test('closeIntro method sets state correctly', () => {
		publicMethods.start(widgetInfo, qset.data)

		//mimic $scope.gameState locally
		let gameState = {
			ingame: false,
			endgame: false,
			score: 0,
			showNext: false,
			splashText: "This or That"
		}

		expect($scope.gameState).toEqual(gameState)
		$scope.closeIntro()
		gameState.ingame = true
		expect($scope.focusStatusButton).toBe(true)
		expect($scope.gameState).toEqual(gameState)
	})

	test('should scale text-only answers based on character length', () => {
		publicMethods.start(widgetInfo, qset.data)

		const shortTextString = "I am a string below 140 characters"
		const longTextString = "I am a string that's quite a bit longer; in fact one might say I'm a really long text string. Some say there may be longer text strings out there, but I'm not sure about that. Have you ever seen one?"

		expect($scope.getAdjustedTextSize(shortTextString)).toEqual(28)
		expect($scope.getAdjustedTextSize(longTextString)).toEqual(23)
	})

	test('should check a "correct" answer choice', () => {
		publicMethods.start(widgetInfo, qset.data)
		$scope.assistiveAlert = jest.fn()

		/*
			answer choices are randomized, so to ensure
			this is tested properly set the first answer
			to full value to indicate it is 'correct'
		*/
		$scope.answers[0].value = 100
		$scope.checkChoice(0)

		expect($scope.question.correct[0]).toEqual('Correct!')
		expect($scope.assistiveAlert).toHaveBeenCalled()

		expect($scope.question.selected).toEqual(true)
		expect($scope.gameState.showNext).toEqual(true)
		const correctFeedback = qset.data.items[0].answers[0].options.feedback
		expect($scope.answers[0].options.feedback).toEqual(correctFeedback)
	})

	test('should check an "incorrect" answer choice', () => {
		publicMethods.start(widgetInfo, qset.data)
		$scope.assistiveAlert = jest.fn()

		/*
			answer choices are randomized, so to ensure
			this is tested properly set the first answer
			to full value to indicate it is 'incorrect'
		*/
		$scope.answers[0].value = 0
		$scope.checkChoice(0)

		expect($scope.question.correct[0]).toEqual('Incorrect')
		expect($scope.question.selected).toEqual(true)
		expect($scope.gameState.showNext).toEqual(true)
		const incorrectFeedback = qset.data.items[0].answers[0].options.feedback
		expect($scope.answers[0].options.feedback).toEqual(incorrectFeedback)
	})

	test('should not check a choice if selected', () => {
		publicMethods.start(widgetInfo, qset.data)
		$scope.assistiveAlert = jest.fn()

		$scope.checkChoice(0)
		expect($scope.question.selected).toEqual(true)
		expect($scope.question.choice).toEqual(0)
		// Question selection should not be updated again
		$scope.checkChoice(1)
		expect($scope.question.choice).toEqual(0)

	})

	//this one probably should not even be possible, but whatever
	test('should send appropriate values to Score.submitQuestionForScoring based on qset version 0', () => {
		publicMethods.start(widgetInfo, qset.data, 0)
		$scope.assistiveAlert = jest.fn()
		quickCheck()
	})
	test('should send appropriate values to Score.submitQuestionForScoring based on qset version 1', () => {
		publicMethods.start(widgetInfo, qset.data, 1)
		$scope.assistiveAlert = jest.fn()
		quickCheck()
	})

	test('should send appropriate values to Score.submitQuestionForScoring based on qset version 2', () => {
		publicMethods.start(widgetInfo, qset.data, 2)
		$scope.assistiveAlert = jest.fn()

		$scope.answers[0].value = 0
		$scope.checkChoice(0)

		const expectedId = qset.data.items[0].id
		const expectedAnswer = qset.data.items[0].answers[0].id
		const expectedValue = $scope.answers[0].text

		expect(Materia.Score.submitQuestionForScoring).toHaveBeenCalledWith(
			expectedId,
			expectedAnswer,
			expectedValue
		)
	})

	test('should handle an answer choice with no feedback', () => {
		// pretend incorrect question has no feedback but correct question does
		publicMethods.start(widgetInfo, qset.data)
		$scope.assistiveAlert = jest.fn()
		delete qset.data.items[0].answers[0].options.feedback

		$scope.answers[0].value = 0
		$scope.checkChoice(0)

		// selected answer should have no feedback
		expect($scope.answers[0].options.feedback).toEqual('')

		const correctFeedback = qset.data.items[0].answers[1].options.feedback
		expect($scope.answers[1].options.feedback).toEqual(correctFeedback)

	})

	test('should handle questions with old feedback solution', () => {
		// pretend question has feedback inside items instead of individual answers

		publicMethods.start(widgetInfo, qset.data)
		$scope.assistiveAlert = jest.fn()

		delete qset.data.items[0].answers[0].options.feedback
		delete qset.data.items[0].answers[1].options.feedback

		qset.data.items[0].options = {}
		qset.data.items[0].options.feedback = 'Incorrect. The Mona Lisa was painted during the Italian Renaissance by artist Leonardo DaVinci.'

		$scope.answers[0].value = 0
		$scope.checkChoice(0)

		expect($scope.answers[0].options.feedback).toEqual(qset.data.items[0].options.feedback)

	})

	test('should update when next is clicked', () => {
		publicMethods.start(widgetInfo, qset.data)
		$scope.assistiveAlert = jest.fn()
		expect($scope.question.current).toBe(0)

		quickSelect()

		expect($scope.gameState.showNext).toEqual(false)
		expect($scope.question.correct).toEqual(['', ''])
		expect($scope.question.choice).toEqual(-1)
		expect($scope.question.transition).toEqual(true)
		expect($scope.hands.thisRaised).toEqual(false)
		expect($scope.hands.thatRaised).toEqual(false)

		//another function should run after a timeout to increment the next question
		$timeout.flush()
		$timeout.verifyNoPendingTasks()
		expect($scope.question.current).toBe(1)
		expect($scope.question.transition).toEqual(false)
		expect($scope.title).toEqual(qset.data.items[1].questions[0].text)
		expect($scope.answers).toEqual(qset.data.items[1].answers)
	})

	test('should toggle lightbox modal', () => {
		$scope.assistiveAlert = jest.fn()
		// Mock setTimeout
		jest.useFakeTimers()
		jest.spyOn(global, 'setTimeout')

		// Open left expand image
		$scope.setLightboxTarget(0)
		expect($scope.lightboxTarget).toBe(0)
		// Test closing
		$scope.setLightboxTarget(-1)
		expect($scope.focusThisExpand).toBe(true)
		// Run the setTimeout timer
		jest.runAllTimers()
		expect($scope.focusThisExpand).toBe(false)

		// Open right expand image
		$scope.setLightboxTarget(1)
		expect($scope.lightboxTarget).toBe(1)
		// Test closing right expand
		$scope.setLightboxTarget(-1)
		expect($scope.focusThatExpand).toBe(true)
		// Run the setTimeout timer
		jest.runAllTimers()
		expect($scope.focusThatExpand).toBe(false)
		expect($scope.lightboxTarget).toBe(-1)
	})

	test('should toggle lightbox zoom', () => {
		$scope.setLightboxZoom(100)
		expect($scope.lightboxZoom).toBe(100)
		$scope.setLightboxZoom(0)
		expect($scope.lightboxZoom).toBe(0)
	})

	test('should end the game when all questions are done', () => {
		const numberQuestions = qset.data.items.length
		publicMethods.start(widgetInfo, qset.data)
		$scope.assistiveAlert = jest.fn()

		for (let i = 0; i < numberQuestions; i++) {
			quickSelect()
			$timeout.flush()
		}

		let expectedState = {
			ingame: false,
			endgame: true,
			score: 0,
			showNext: false,
			splashText: "The End"
		}

		expect($scope.question.current).toBe(numberQuestions)
		expect($scope.gameState).toEqual(expectedState)

		expect(Materia.Engine.end).toHaveBeenNthCalledWith(1, false)
		expect($scope.title).toBe('')
	})

	test('should end the game when viewing scores', () => {
		const numberQuestions = qset.data.items.length
		publicMethods.start(widgetInfo, qset.data)
		$scope.assistiveAlert = jest.fn()

		for (let i = 0; i < numberQuestions; i++) {
			quickSelect()
			$timeout.flush()
		}

		$scope.viewScores()
		//second call to Materia.Engine.end since $scope.endGame called it too
		expect(Materia.Engine.end).toHaveBeenNthCalledWith(2, true)
	})

	test('should return from randomizing answer order when there are no answers', () => {
		const testQSet = {
			data: {
				items: [
					{
						questions: [{ text: 'test' }],
						answers: false
					}
				]
			}
		}

		publicMethods.start(widgetInfo, testQSet.data)
		expect($scope.answers).toBe(false)
	})

	function quickQuestion(questionId) {
		return {
			materiaType: 'question',
			id: null,
			type: 'MC',
			questions: [{ text: questionId }],
			answers: [
				{
					id: null,
					text: '',
					value: 100,
					options: {
						asset: {
							materiaType: 'asset',
							id: ''
						},
						feedback: ''
					}
				},
				{
					id: null,
					text: 'test',
					value: 0,
					options: {
						asset: {
							materiaType: 'asset',
							id: ''
						},
						feedback: ''
					}
				}
			],
			options: { answerType: ['image', 'image'] }
		}
	}

	test('should shuffle questions when necessary', () => {
		$scope.assistiveAlert = jest.fn()
		const numberQuestions = 20

		//kind of a hack, but it'll do
		const expectedOrder = [9, 19, 3, 4, 5, 6, 7, 8, 0, 10, 11, 12, 13, 14, 15, 16, 17, 18, 1, 2]

		global.Math.random = jest.fn(() => 0.1)

		qset.data.items = []
		for (let i = 0; i < numberQuestions; i++) {
			qset.data.items.push(quickQuestion(i))
		}

		qset.data.options = { randomizeOrder: true }
		publicMethods.start(widgetInfo, qset.data)

		expect(Math.random).toHaveBeenCalledTimes(numberQuestions)
		for (let i = 0; i < numberQuestions; i++) {
			//the way the current question is stored in scope makes it hard to check
			//so our function above sets the question's 'title' to a number that
			// corresponds to that question's 'index'
			//we can check the current 'title' to know what the current question is
			expect($scope.title).toBe(expectedOrder[i])
			quickSelect()
			$timeout.flush()
		}
	})

	test('should shuffle questions when randomize is false but enableQuestionBank is true with qb value at 3', () => {

		let widgetInfoCopy = JSON.parse(JSON.stringify(widgetInfo));
		let qsetCopy = JSON.parse(JSON.stringify(qset));
		qsetCopy.data.options = { randomizeOrder: false, enableQuestionBank: true, questionBankVal: 3}
		publicMethods.start(widgetInfoCopy, qsetCopy.data)

		const originalArray = [...qset.data.items];

		// qset items haven't been randomized so we must shuffle the items
		if(qsetCopy.data.options.randomizeOrder === true) {
			let qbItemsLength = qsetCopy.data.options.questionBankVal
			let rndStart = Math.floor(Math.random() * (qsetCopy.data.items.length - qbItemsLength + 1))
			qsetCopy.data.items = qsetCopy.data.items.slice(rndStart, rndStart + qbItemsLength)
		}
		else {
			ctlPlayer.shuffleArray(qsetCopy.data.items)
			let qbItemsLength = qsetCopy.data.options.questionBankVal
			let rndStart = Math.floor(Math.random() * (qsetCopy.data.items.length - qbItemsLength + 1))
			qsetCopy.data.items = qsetCopy.data.items.slice(rndStart, rndStart + qbItemsLength)
		}

		// array should be smaller since it got sliced
		expect(originalArray.length).not.toEqual(qsetCopy.data.items.length);

	})

	test('should shuffle questions when randomize is true and so is enableQuestionBank', () => {

		let widgetInfoCopy = JSON.parse(JSON.stringify(widgetInfo));
		let qsetCopy = JSON.parse(JSON.stringify(qset));
		qsetCopy.data.options = { randomizeOrder: true, enableQuestionBank: true, questionBankVal: 3}
		publicMethods.start(widgetInfoCopy, qsetCopy.data)

		const originalArray = [...qset.data.items];

		// qsetCopy items was randomized earlier in the player code so no need to reshuffle
		if(qsetCopy.data.options.randomizeOrder === true) {
			let qbItemsLength = qsetCopy.data.options.questionBankVal
			let rndStart = Math.floor(Math.random() * (qsetCopy.data.items.length - qbItemsLength + 1))
			qsetCopy.data.items = qsetCopy.data.items.slice(rndStart, rndStart + qbItemsLength)
		}
		else {
			ctlPlayer.shuffleArray(qsetCopy.data.items)
			let qbItemsLength = qsetCopy.data.options.questionBankVal
			let rndStart = Math.floor(Math.random() * (qsetCopy.data.items.length - qbItemsLength + 1))
			qsetCopy.data.items = qsetCopy.data.items.slice(rndStart, rndStart + qbItemsLength)
		}

		// array should be smaller since it got sliced
		expect(originalArray.length).not.toEqual(qsetCopy.data.items.length);

	})

	test('should not shuffle questions if there are none', () => {
		global.Math.random = jest.fn(() => 0.1)
		qset.data.items = []
		qset.data.options = { randomizeOrder: true }
		publicMethods.start(widgetInfo, qset.data)
		expect(Math.random).not.toHaveBeenCalled()
	})

	test('should test key presses', () => {
		$scope.assistiveAlert = jest.fn()
		publicMethods.start(widgetInfo, qset.data)
		$scope.gameState.ingame = false
		// Start screen should not register key presses
		$scope.selectChoice({key: 'a'})
		expect($scope.selectedChoice).toBe(-1);
		// Start screen should open instructions
		$scope.selectChoice({key: 'H'})
		expect($scope.instructionsOpen).toBe(true)
		$scope.selectChoice({key: 'h'})
		expect($scope.instructionsOpen).toBe(false)

		// Enter game
		$scope.gameState.ingame = true
		// Test this selection
		$scope.selectChoice({key: 'a'})
		expect($scope.selectedChoice).toBe(0);
		$scope.selectChoice({key: 'A'})
		expect($scope.selectedChoice).toBe(0);
		// Test that selection
		$scope.selectChoice({key: 'd'})
		expect($scope.selectedChoice).toBe(1);
		$scope.selectChoice({key: 'D'})
		expect($scope.selectedChoice).toBe(1);
		// Test question key
		$scope.selectChoice({key: 'q'})
		expect($scope.pressedQOnce).toBe(true)
		$scope.selectChoice({key: 'Q'})
		expect($scope.pressedQOnce).toBe(false)
		// Test help key
		$scope.selectChoice({key: 'H'})
		expect($scope.instructionsOpen).toBe(true)
		$scope.selectChoice({key: 'h'})
		expect($scope.instructionsOpen).toBe(false)

	})

})
