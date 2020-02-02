// @TODO: the anuglar modules like 'player' have
// been re-factored to make unit testing easier
// these tests still lag behind those changes
// requiring them to mock all of angular, making
// them quite a bit more complicated, and 'higher'
// up in the unit -> functional testing ladder
// in general we should continue to push toward more
// direct unit tests as this project continues to evolve

describe('Player Controller', function() {
	require('angular/angular.js')
	require('angular-mocks/angular-mocks.js')

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
				getImageAssetUrl: jest.fn(asset => {
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
			'bogart.jpg'
		]
		for (const index in expectedImages) {
			const fullName = 'MEDIA_URL/assets/img/demo/' + expectedImages[index]
			expect($scope.images).toContain(fullName)
		}
	})

	test('controller selects the first question after starting', () => {
		publicMethods.start(widgetInfo, qset.data)

		expect($scope.questions.current).toEqual(0)
		expect($scope.title).toEqual(qset.data.items[0].questions[0].text)
		expect($scope.answers).toEqual(qset.data.items[0].answers)
		expect($scope.questions.selected).toEqual(false)
		expect($scope.questions.transition).toEqual(false)
	})

	test('closeIntro method sets state correctly', () => {
		publicMethods.start(widgetInfo, qset.data)

		//mimic $scope.gameState locally
		let gameState = {
			ingame: false,
			endgame: false,
			score: 0,
			showNext: false
		}

		expect($scope.gameState).toEqual(gameState)
		$scope.closeIntro()
		gameState.ingame = true
		expect($scope.gameState).toEqual(gameState)
	})

	test('should check a "correct" answer choice', () => {
		publicMethods.start(widgetInfo, qset.data)

		/*
			answer choices are randomized, so to ensure
			this is tested properly set the first answer
			to full value to indicate it is 'correct'
		*/
		$scope.answers[0].value = 100
		$scope.checkChoice(0)

		expect($scope.questions.correct[0]).toEqual('Correct!')

		expect($scope.questions.selected).toEqual(true)
		expect($scope.gameState.showNext).toEqual(true)
		expect($scope.questions.feedback[0]).toEqual('')
	})

	test('should check an "incorrect" answer choice', () => {
		publicMethods.start(widgetInfo, qset.data)

		/*
			answer choices are randomized, so to ensure
			this is tested properly set the first answer
			to full value to indicate it is 'incorrect'
		*/
		$scope.answers[0].value = 0
		$scope.checkChoice(0)

		expect($scope.questions.correct[0]).toEqual('Incorrect')
		expect($scope.questions.selected).toEqual(true)
		expect($scope.gameState.showNext).toEqual(true)
		const questionFeedback = qset.data.items[0].options.feedback
		expect($scope.questions.feedback[0]).toEqual(questionFeedback)
	})

	//this one probably should not even be possible, but whatever
	test('should send appropriate values to Score.submitQuestionForScoring based on qset version 0', () => {
		publicMethods.start(widgetInfo, qset.data, 0)
		quickCheck()
	})
	test('should send appropriate values to Score.submitQuestionForScoring based on qset version 1', () => {
		publicMethods.start(widgetInfo, qset.data, 1)
		quickCheck()
	})

	test('should send appropriate values to Score.submitQuestionForScoring based on qset version 2', () => {
		publicMethods.start(widgetInfo, qset.data, 2)

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

	test('should handle an incorrect answer choice with no feedback', () => {
		//pretend the first question has no feedback for wrong answers
		delete qset.data.items[0].options.feedback
		publicMethods.start(widgetInfo, qset.data)

		$scope.answers[0].value = 0
		$scope.checkChoice(0)

		expect($scope.questions.feedback[0]).toEqual('')
	})

	test('should update when next is clicked', () => {
		publicMethods.start(widgetInfo, qset.data)
		expect($scope.questions.current).toBe(0)

		quickSelect()

		expect($scope.gameState.showNext).toEqual(false)
		expect($scope.questions.correct).toEqual(['', ''])
		expect($scope.questions.choice).toEqual(-1)
		expect($scope.questions.transition).toEqual(true)
		expect($scope.hands.thisRaised).toEqual(false)
		expect($scope.hands.thatRaised).toEqual(false)

		//another function should run after a timeout to increment the next question
		$timeout.flush()
		$timeout.verifyNoPendingTasks()
		expect($scope.questions.current).toBe(1)
		expect($scope.questions.transition).toEqual(false)
		expect($scope.title).toEqual(qset.data.items[1].questions[0].text)
		expect($scope.answers).toEqual(qset.data.items[1].answers)
	})

	test('should end the game when all questions are done', () => {
		const numberQuestions = qset.data.items.length
		publicMethods.start(widgetInfo, qset.data)

		for (let i = 0; i < numberQuestions; i++) {
			quickSelect()
			$timeout.flush()
		}

		let expectedState = {
			ingame: false,
			endgame: true,
			score: 0,
			showNext: false
		}

		expect($scope.questions.current).toBe(numberQuestions)
		expect($scope.gameState).toEqual(expectedState)

		expect(Materia.Engine.end).toHaveBeenNthCalledWith(1, false)
		expect($scope.title).toBe('')
	})

	test('should end the game when viewing scores', () => {
		const numberQuestions = qset.data.items.length
		publicMethods.start(widgetInfo, qset.data)

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
						}
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
						}
					}
				}
			],
			options: { feedback: '' }
		}
	}

	test('should shuffle questions when necessary', () => {
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

	test('should not shuffle questions if there are none', () => {
		global.Math.random = jest.fn()
		qset.data.items = []
		qset.data.options = { randomizeOrder: true }
		publicMethods.start(widgetInfo, qset.data)
		expect(Math.random).not.toHaveBeenCalled()
	})
})
