

describe('Score Screen Controller', function() {
	require('angular/angular.js')
	require('angular-animate/angular-animate.js')
	require('angular-sanitize/angular-sanitize.js')
	require('angular-mocks/angular-mocks.js')
	require('angular-aria/angular-aria.js')

	let $scope
	let $controller
	let $timeout
	let widgetInfo
	let qset
	let publicMethods
	let $sanitize
	let scoreTable

	beforeEach(() => {
		jest.resetModules()

		qset = {
			items: [
				{
					id: "1",
					materiaType: "question",
					questions: [{
							text: "What's the average velocity of an unladen swallow?"
						}],
					answers: [
						{
							id: "1A",
							text: "African",
							value: 0,
							options: {
								asset: {
									materiaType: "asset",
									id: "<%MEDIA='assets/img/demo/the_fall_of_phaeton.jpg'%>"
								}
							}
						},
						{
							id: "1B",
							text: "European",
							value: 100,
							options: {
								asset: {
									materiaType: "asset",
									id: "<%MEDIA='assets/img/demo/mona_lisa.jpg'%>"
								}
							}
						}
					],
					options: {}
				},
				{
					id: "2",
					materiaType: "question",
					questions: [{
							text: "What's your favorite color?"
						}],
					answers: [
						{
							id: "2A",
							text: "blue",
							value: 0,
							options: {
								asset: {
									materiaType: "asset",
									id: null,
									value: "https://www.youtube.com/watch?v=rLDgQg6bq7o",
									type: "video"
								}
							}
						},
						{
							id: "2B",
							text: "yellow!",
							value: 100,
							options: {
								asset: {
									materiaType: "asset",
									id: "birds.mp3",
									type: "audio",
									value: "<%MEDIA='assets/img/demo/birds.mp3'%>"
								}
							}
						}
					],
					options: {}
				}
			]
		}

		scoreTable = [
			{
				data: [
					"What's the average velocity of an unladen swallow?",
					"1",
					"African",
					"European"
				],
				data_style: [
					"question",
					"question_id",
					"response",
					"answer"
				],
				display_score: true,
				feedback: null,
				graphic: "score",
				score: 100,
				style: "full-value",
				symbol: "%",
				tag: "div",
				type: "SCORE_QUESTION_ANSWERED"
			},
			{
				data: [
					"What's your favorite color?",
					"2",
					"blue",
					"yellow!"
				],
				data_style: [
					"question",
					"question_id",
					"response",
					"answer"
				],
				display_score: true,
				feedback: null,
				graphic: "score",
				score: 0,
				style: "full-value",
				symbol: "%",
				tag: "div",
				type: "SCORE_QUESTION_ANSWERED"
			}
		]

		// mock materia
		global.Materia = {
			ScoreCore: {
				start: jest.fn(methods => {
					publicMethods = methods
				}),
				setHeight: jest.fn(),
				// alert: jest.fn(),
				// cancelSave: jest.fn(),
				// save: jest.fn().mockImplementation((title, qset) => {
				// 	//the creator core calls this on the creator when saving is successful
				// 	publicMethods.onSaveComplete()
				// 	return { title: title, qset: qset }
				// }),
				hideResultsTable: jest.fn(),
				getMediaUrl: jest.fn(asset => {
					const cleaned = ('' + asset).replace(/<%MEDIA='(.+?)'%>/g, '$1')
					return 'MEDIA_URL/' + cleaned
				})
			}
		}

		// load qset
		// widgetInfo = require('./demo.json')
		// qset = widgetInfo.qset.data

		require('./scoreScreen')
		// make angular mock work with the module
		angular.mock.module('ThisOrThatScorescreen')

		// mock scope
		$scope = {
			$apply: jest.fn().mockImplementation(fn => {
				fn ? fn() : null
			})
		}

		// initialize the angular controller
		inject(function(_$controller_) {
			// instantiate the controller
			$controller = _$controller_('ThisOrThatScoreCtrl', { $scope: $scope })
		})
	})

	test('ScoreCore should initialize', () => {
		expect(global.Materia.ScoreCore.start).toHaveBeenCalledTimes(1)
	})

	test('should assemble $scope.items from scoreTable', () => {
		publicMethods.start({}, qset, scoreTable, false, 1)
		expect($scope.items.length).toBe(scoreTable.length)
	})

	test('should hide results table', () => {
		expect(global.Materia.ScoreCore.hideResultsTable).toHaveBeenCalledTimes(1)
	})

	test('should properly calculate deduction', () => {
		publicMethods.start({}, qset, scoreTable, false, 1)
		expect($scope.items[0].deduction).toBe(0)
		expect($scope.items[1].deduction).toBe(50)
	})

	test('should return -1 when question ID is not found in qset', () => {
		const testQset = {
			items: [
				{ id: '1', questions: [{ text: 'Question 1' }] },
				{ id: '2', questions: [{ text: 'Question 2' }] }
			]
		}

		expect(global.getQuestionIndex(testQset, 'nonexistent_id')).toBe(-1)
		expect(global.getQuestionIndex(testQset, '1')).toBe(0)
		expect(global.getQuestionIndex(testQset, '2')).toBe(1)
	})


	test('should fetch media URL for left asset when value is missing', () => {
		// Modify the qset for the test case
		qset.items[0].answers[0].options.asset.value = null

		publicMethods.start({}, qset, scoreTable, false, 1)
		expect($scope.items[0].left.asset.value).toBe(
			`MEDIA_URL/assets/img/demo/the_fall_of_phaeton.jpg`
		)
	})

	test('should trust mp3 URL for right asset when type is video/mp3 file', () => {
		publicMethods.start({}, qset, scoreTable, false, 1)
		expect($scope.items[1].right.asset.value).toBe(
			'MEDIA_URL/birds.mp3'
		)
	})
	test('should recieve trusted object for video', () => {
		qset.items[1].answers[1].options.asset.type = 'video'
		qset.items[1].answers[1].options.asset.value = 'https://materia.com/video.mp4'

		publicMethods.start({}, qset, scoreTable, false, 1)

		expect($scope.items[1].right.asset.value).toEqual(
			expect.objectContaining({
				$$unwrapTrustedValue: expect.any(Function)
			})
		)
	})

})
