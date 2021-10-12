// @TODO: the anuglar modules like 'player' have
// been re-factored to make unit testing easier
// these tests still lag behind those changes
// requiring them to mock all of angular, making
// them quite a bit more complicated, and 'higher'
// up in the unit -> functional testing ladder
// in general we should continue to push toward more
// direct unit tests as this project continues to evolve

describe('Creator Controller', function() {
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

	function quickQuestion(givenID) {
		
		$scope.addQuestion({
			title: 'test title ' + givenID,
			correct: {
				type: 'image',
				value: 'image 1',
				alt: 'image 1 alt text',
				id: 'image 1 id'
			},
			incorrect: {
				type: 'image',
				value: 'image 2',
				alt: 'image 2 alt text',
				id: 'image 2 id'
			},
			id: givenID,
			feedback: 'feedback'
		})

		$timeout.flush()
		$timeout.verifyNoPendingTasks()
	}

	beforeEach(() => {
		jest.resetModules()

		// mock materia
		global.Materia = {
			CreatorCore: {
				start: jest.fn(methods => {
					publicMethods = methods
				}),
				alert: jest.fn(),
				cancelSave: jest.fn(),
				save: jest.fn().mockImplementation((title, qset) => {
					//the creator core calls this on the creator when saving is successful
					publicMethods.onSaveComplete()
					return { title: title, qset: qset }
				}),
				showMediaImporter: jest.fn(),
				getMediaUrl: jest.fn(asset => {
					const cleaned = ('' + asset).replace(/<%MEDIA='(.+?)'%>/g, '$1')
					return 'MEDIA_URL/' + cleaned
				})
			}
		}

		// load qset
		widgetInfo = require('./demo.json')
		qset = widgetInfo.qset

		require('./creator')
		// make angular mock work with the module
		angular.mock.module('ThisOrThatCreator')

		// mock scope
		$scope = {
			$apply: jest.fn().mockImplementation(fn => {
				fn ? fn() : null
			})
		}

		// initialize the angular controller
		inject(function(_$controller_, _$timeout_, _$sanitize_) {
			$timeout = _$timeout_
			$sanitize = _$sanitize_
			// instantiate the controller
			$controller = _$controller_('ThisOrThatCreatorCtrl', { $scope: $scope })
		})
	})

	test('controller provides the correct public methods to CreatorCore.start', () => {
		expect(global.Materia.CreatorCore.start).toHaveBeenCalledTimes(1)
		expect(Object.keys(publicMethods)).toEqual([
			'initNewWidget',
			'initExistingWidget',
			'onSaveClicked',
			'onSaveComplete',
			'onQuestionImportComplete',
			'onMediaImportComplete'
		])
	})

	test('should edit a new widget', () => {
		const defaultQuestion = {
			title: '',
			correct: {
				type: null,
				id: null,
				alt: '',
				value: null,
				answerId: null
			},
			incorrect: {
				type: null,
				id: null,
				alt: '',
				value: null,
				answerId: null
			},
			isValid: true,
			id: null,
			feedback: ''
		}

		publicMethods.initNewWidget(widgetInfo)
		expect($scope.title).toBe('My This or That widget')
		expect($scope.dialog.intro).toBe(true)

		//the only question should be the default one created on init
		expect($scope.questions).toEqual([defaultQuestion])

		//the creator has a check for 'actions.activate', dunno where that's set
		// $scope.actions.activate = false
	})

	test('should set the default title when no title is input', () => {
		publicMethods.initNewWidget(widgetInfo)

		//this is called whenever an input field on the page is changed
		$scope.setTitle()
		expect($scope.title).toBe('My This or That widget')
		expect($scope.dialog.intro).toBe(false)
		expect($scope.step).toBe(1)
	})

	test('should rearrange questions', () => {
		publicMethods.initNewWidget(widgetInfo)
		$scope.addQuestion()
		$timeout.flush()
		$timeout.verifyNoPendingTasks()

		expect($scope.questions.length).toBe(2)

		const firstQuestion = $scope.questions[0]

		$scope.moveUp(0)
		expect($scope.questions[0]).toBe(firstQuestion)
		$scope.moveDown(0)
		expect($scope.questions[1]).toBe(firstQuestion)
		$scope.moveUp(1)
		expect($scope.questions[0]).toBe(firstQuestion)
		$scope.moveDown(1)
		expect($scope.questions[0]).toBe(firstQuestion)
	})

	test('should proceed through the tutorial correctly', () => {
		publicMethods.initNewWidget(widgetInfo)

		expect($scope.tutorial.step).toBe(1)

		//normally this would be called after a button on the page is clicked
		$scope.tutorialIncrement(1)
		expect($scope.tutorial.step).toBe(2)
		$scope.tutorialIncrement(1)
		expect($scope.tutorial.step).toBe(2)
		$scope.tutorialIncrement(6)
		expect($scope.tutorial.step).toBe(2)

		$scope.tutorialIncrement(2)
		expect($scope.tutorial.step).toBe(3)
		$scope.tutorialIncrement(2)
		expect($scope.tutorial.step).toBe(3)

		$scope.tutorialIncrement(3)
		expect($scope.tutorial.step).toBe(4)
		$scope.tutorialIncrement(3)
		expect($scope.tutorial.step).toBe(4)

		$scope.tutorialIncrement(4)
		expect($scope.tutorial.step).toBe(5)
		$scope.tutorialIncrement(4)
		expect($scope.tutorial.step).toBe(5)

		$scope.tutorialIncrement(5)
		expect($scope.tutorial.step).toBe(6)
		$scope.tutorialIncrement(5)
		expect($scope.tutorial.step).toBe(6)

		$scope.tutorialIncrement(6)
		expect($scope.tutorial.step).toBe(7)
		$scope.tutorialIncrement(6)
		expect($scope.tutorial.step).toBe(7)

		$scope.tutorialIncrement(7)
		expect($scope.tutorial.step).toBe(8)
		$scope.tutorialIncrement(7)
		expect($scope.tutorial.step).toBe(8)

		$scope.tutorialIncrement(8)
		expect($scope.tutorial.step).toBe(9)
		$scope.tutorialIncrement(8)
		expect($scope.tutorial.step).toBe(9)

		$scope.tutorialIncrement(9)
		expect($scope.tutorial.step).toBeNull()
		$scope.tutorialIncrement(9)
		expect($scope.tutorial.step).toBeNull()
	})

	test('should fail validation when no questions are completed', () => {
		publicMethods.initNewWidget(widgetInfo)

		publicMethods.onSaveClicked('save')
		expect(Materia.CreatorCore.cancelSave).toHaveBeenCalledWith(
			'Please make sure every question is complete'
		)

		$scope.validation('change', 0)
		expect($scope.questions[0].invalid).toBe(true)
		expect($scope.dialog.invalid).toBe(true)
	})

	test('should pass validation when all questions are complete', () => {
		publicMethods.initNewWidget(widgetInfo)

		$scope.questions[0].title = 'question 1'
		$scope.questions[0].correct.value = 'image 1'
		$scope.questions[0].correct.alt = 'alt 1'
		$scope.questions[0].correct.type = 'image'
		$scope.questions[0].incorrect.value = 'image 2'
		$scope.questions[0].incorrect.alt = 'alt 2'
		$scope.questions[0].incorrect.type = 'image'
		$scope.dialog.invalid = false

		$scope.validation('change', 0)
		expect($scope.questions[0].invalid).toBe(false)

		publicMethods.onSaveClicked()
		expect(Materia.CreatorCore.save).toHaveBeenCalled()
	})

	test('should not save without a title', () => {
		publicMethods.initNewWidget(widgetInfo)

		//add a valid question so we don't get the 'not all questions are complete' message
		$scope.questions[0].title = 'question 1'
		$scope.questions[0].correct.value = 'image 1'
		$scope.questions[0].correct.alt = 'alt 1'
		$scope.questions[0].correct.type = 'image'
		$scope.questions[0].incorrect.value = 'image 2'
		$scope.questions[0].incorrect.alt = 'alt 2'
		$scope.questions[0].incorrect.type = 'image'
		$scope.dialog.invalid = false

		$scope.title = ''
		publicMethods.onSaveClicked()

		expect(Materia.CreatorCore.cancelSave).toHaveBeenCalledWith('Please enter a title.')
	})

	test('should add a new question', () => {
		publicMethods.initNewWidget(widgetInfo)

		expect($scope.questions.length).toBe(1)

		$scope.addQuestion()
		$timeout.flush()
		$timeout.verifyNoPendingTasks()

		expect($scope.questions.length).toBe(2)
	})

	test('should add a new question with given parameters', () => {
		publicMethods.initNewWidget(widgetInfo)

		expect($scope.questions.length).toBe(1)

		quickQuestion(1)

		expect($scope.questions.length).toBe(2)
		expect($scope.questions[1].title).toBe('test title 1')
		expect($scope.questions[1].correct.type).toBe('image')
		expect($scope.questions[1].correct.alt).toBe('image 1 alt text')
		expect($scope.questions[1].correct.value).toBe('image 1')
		expect($scope.questions[1].incorrect.type).toBe('image')
		expect($scope.questions[1].incorrect.alt).toBe('image 2 alt text')
		expect($scope.questions[1].incorrect.value).toBe('image 2')
		expect($scope.questions[1].id).toBe(1)
	})

	test('should slide left when selecting the previous question', () => {
		publicMethods.initNewWidget(widgetInfo)

		//first add two questions so going to a previous question actually works
		quickQuestion(1)
		quickQuestion(2)

		$scope.prev()
		expect($scope.actions.slideleft).toBe(true)
		$timeout.flush()
		$timeout.verifyNoPendingTasks()

		expect($scope.currIndex).toBe(1)
		expect($scope.actions.slideleft).toBe(false)
	})

	test('should slide right when selecting the next question', () => {
		publicMethods.initNewWidget(widgetInfo)

		quickQuestion(1)
		quickQuestion(2)

		$scope.prev()
		$timeout.flush()

		$scope.next()
		expect($scope.actions.slideright).toBe(true)
		$timeout.flush()
		$timeout.verifyNoPendingTasks()

		expect($scope.currIndex).toBe(2)
		expect($scope.actions.slideright).toBe(false)
	})

	test('should not add any new questions after 50', () => {
		publicMethods.initNewWidget(widgetInfo)

		let i = 1
		while ($scope.questions.length < 50) {
			quickQuestion(i++)
		}

		expect($scope.questions.length).toBe(50)

		//there won't be any tasks to flush because the code won't ever reach the
		// point to add another question through the timeout.
		$scope.addQuestion()
		expect($scope.questions.length).toBe(50)
	})

	test('should move to a specific index', () => {
		publicMethods.initNewWidget(widgetInfo)

		//just add the max number so we can move around
		let i = 1
		while ($scope.questions.length < 30) {
			quickQuestion(i++)
		}

		//start by choosing a lower index
		$scope.selectCurrent(25)
		$timeout.flush()
		$timeout.verifyNoPendingTasks()
		expect($scope.currIndex).toBe(25)
	})

	test('should move right when selecting a higher index', () => {
		publicMethods.initNewWidget(widgetInfo)

		//just add the max number so we can move around
		let i = 1
		while ($scope.questions.length < 40) {
			quickQuestion(i++)
		}

		//start by choosing a lower index
		$scope.selectCurrent(20)
		$timeout.flush()
		expect($scope.currIndex).toBe(20)
		//then move higher
		$scope.selectCurrent(30)
		expect($scope.actions.slideright).toBe(true)
		$timeout.flush()
		expect($scope.currIndex).toBe(30)
	})

	test('should move left when selecting a lower index', () => {
		publicMethods.initNewWidget(widgetInfo)

		//just add the max number so we can move around
		let i = 1
		while ($scope.questions.length < 40) {
			quickQuestion(i++)
		}

		$scope.selectCurrent(30)
		expect($scope.actions.slideleft).toBe(true)
		$timeout.flush()
		expect($scope.currIndex).toBe(30)
	})

	test('should loop to the start when going next on the last question', () => {
		publicMethods.initNewWidget(widgetInfo)

		let i = 1
		while ($scope.questions.length < 50) {
			quickQuestion(i++)
		}

		$scope.selectCurrent(49)
		$timeout.flush()
		expect($scope.currIndex).toBe(49)

		$scope.next()
		$timeout.flush()
		expect($scope.currIndex).toBe(0)
	})

	test('should loop to the end when going prev on the first question', () => {
		publicMethods.initNewWidget(widgetInfo)

		let i = 1
		while ($scope.questions.length < 50) {
			quickQuestion(i++)
		}

		$scope.selectCurrent(0)
		$timeout.flush()
		expect($scope.currIndex).toBe(0)

		$scope.prev()
		$timeout.flush()
		expect($scope.currIndex).toBe(49)
	})

	test('should duplicate a question when there are less than 50', () => {
		publicMethods.initNewWidget(widgetInfo)

		let i = 1
		while ($scope.questions.length < 49) {
			quickQuestion(i++)
		}

		expect($scope.currIndex).toBe(48)
		expect($scope.questions.length).toBe(49)
		$scope.duplicate(25)

		$timeout.flush()

		expect($scope.questions.length).toBe(50)
		expect($scope.questions[49].title).toBe('test title 25')
		expect($scope.currIndex).toBe(49)
	})

	test('should not duplicate a question when there are 50 questions', () => {
		publicMethods.initNewWidget(widgetInfo)

		let i = 1
		while ($scope.questions.length < 50) {
			quickQuestion(i++)
		}

		expect($scope.questions.length).toBe(50)
		$scope.duplicate(0)
		expect($scope.questions.length).toBe(50)
		expect($scope.actions.add).toBe(false)
	})

	test('should remove a question', () => {
		publicMethods.initNewWidget(widgetInfo)

		let i = 1
		while ($scope.questions.length < 30) {
			quickQuestion(i++)
		}

		$scope.selectCurrent(25)
		$timeout.flush()

		$scope.questions[25].title = 'question 26'
		$scope.questions[26].title = 'question 27'

		expect($scope.questions[25].title).toBe('question 26')

		$scope.removeQuestion(25)

		expect($scope.questions[25].title).toBe('question 27')
	})

	test('should remove an image', () => {
		publicMethods.initNewWidget(widgetInfo)

		quickQuestion(1)

		$scope.clearMedia(1, $scope.CORRECT)
		expect($scope.questions[1].correct.value).toBe(null)
		expect($scope.questions[1].correct.type).toBe('image')

		$scope.clearMedia(1, $scope.INCORRECT)
		expect($scope.questions[1].incorrect.value).toBe(null)
		expect($scope.questions[1].incorrect.type).toBe('image')
	})

	test('should clear media type', () => {
		publicMethods.initNewWidget(widgetInfo)

		quickQuestion(1)

		$scope.clearType(1, $scope.CORRECT)
		expect($scope.questions[1].correct.type).toBe(null)
		expect($scope.questions[1].correct.id).toBe(null)
		expect($scope.questions[1].correct.value).toBe(null)
		expect($scope.questions[1].correct.alt).toBe('')

		$scope.clearType(1, $scope.INCORRECT)
		expect($scope.questions[1].incorrect.type).toBe(null)
		expect($scope.questions[1].incorrect.id).toBe(null)
		expect($scope.questions[1].incorrect.value).toBe(null)
		expect($scope.questions[1].incorrect.alt).toBe('')
	})

	test('should correctly remove all questions', () => {
		publicMethods.initNewWidget(widgetInfo)

		let i = 1
		while ($scope.questions.length < 10) {
			quickQuestion(i++)
		}

		while ($scope.questions.length > 0) {
			$scope.removeQuestion($scope.questions[0])
		}

		expect($scope.actions.removelast).toBe(true)
		$timeout.flush()

		expect($scope.questions.length).toBe(0)
	})

	test('should hide the modal', () => {
		publicMethods.initNewWidget(widgetInfo)

		$scope.hideModal()
		expect($scope.dialog.invalid).toBe(false)
		expect($scope.dialog.edit).toBe(false)
		expect($scope.dialog.intro).toBe(false)
	})

	test('should limit titles to 500 characters', () => {
		publicMethods.initNewWidget(widgetInfo)

		let expectedTitle = ''
		for (let i = 0; i < 500; i++) {
			expectedTitle += 'a'
		}

		let bigTitle = ''
		for (let i = 0; i < 520; i++) {
			bigTitle += 'a'
		}
		$scope.addQuestion()
		$scope.questions[0].title = bigTitle

		$scope.limitLength()
		expect($scope.questions[0].title).toBe(expectedTitle)
	})

	test('should update answer type', () => {
		publicMethods.initNewWidget(widgetInfo)

		quickQuestion(1)
		quickQuestion(2)
		quickQuestion(3)
		quickQuestion(4)

		$scope.updateAnswerType('text', 0, $scope.CORRECT)
		expect($scope.questions[0].correct.type).toBe('text')
		$scope.updateAnswerType('text', 0, $scope.INCORRECT)
		expect($scope.questions[0].incorrect.type).toBe('text')

		$scope.updateAnswerType('audio', 1, $scope.CORRECT)
		expect($scope.questions[1].correct.type).toBe('audio')
		$scope.updateAnswerType('audio', 1, $scope.INCORRECT)
		expect($scope.questions[1].incorrect.type).toBe('audio')

		$scope.updateAnswerType('video', 2, $scope.CORRECT)
		expect($scope.questions[2].correct.type).toBe('video')
		$scope.updateAnswerType('video', 2, $scope.INCORRECT)
		expect($scope.questions[2].incorrect.type).toBe('video')

		$scope.updateAnswerType('image', 3, $scope.CORRECT)
		expect($scope.questions[3].correct.type).toBe('image')
		$scope.updateAnswerType('image', 3, $scope.INCORRECT)
		expect($scope.questions[3].incorrect.type).toBe('image')
	})

	test('should set an image url', () => {
		publicMethods.initNewWidget(widgetInfo)

		quickQuestion(1)

		$scope.requestImage(0, $scope.CORRECT)
		$scope.setURL('test url', 4)

		expect(Materia.CreatorCore.showMediaImporter).toHaveBeenCalled()

		expect($scope.questions[0].correct.value).toBe('test url')
		expect($scope.questions[0].correct.id).toBe(4)

		const media = [{ id: 5 }]
		publicMethods.onMediaImportComplete(media)

		expect($scope.questions[0].correct.value).toBe('MEDIA_URL/5')
		expect($scope.questions[0].correct.id).toBe(5)
	})

	test('should set an audio url', () => {
		publicMethods.initNewWidget(widgetInfo)

		quickQuestion(1)

		$scope.requestAudio(0, 0)
		$scope.setURL('test url', 4)

		expect(Materia.CreatorCore.showMediaImporter).toHaveBeenCalled()

		expect($scope.questions[0].correct.value).toBe('test url')
		expect($scope.questions[0].correct.id).toBe(4)

		const media = [{ id: 5 }]
		publicMethods.onMediaImportComplete(media)

		expect($scope.questions[0].correct.value).toBe('MEDIA_URL/5')
		expect($scope.questions[0].correct.id).toBe(5)
	})

	test('should embed video', () => {
		publicMethods.initNewWidget(widgetInfo)

		// quickQuestion(1)
		$scope.addQuestion({
			title: 'test title 1',
			correct: {
				type: 'video',
				value: '',
				alt: '',
				id: null
			},
			incorrect: {
				type: 'image',
				value: 'image 2',
				alt: 'image 2 alt text',
				id: null
			},
			id: 1,
			feedback: 'feedback'
		})

		$timeout.flush()
		$timeout.verifyNoPendingTasks()

		$scope.questions[1].correct.value = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
		$scope.questions[1].correct.videoValid = true
		$scope.embedVideo(1, $scope.CORRECT)
		expect($scope.questions[1].correct.value).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ')

		$scope.questions[1].correct.value = 'https://www.youtube.com/embed/dQw4w9WgXcQ'
		$scope.questions[1].correct.videoValid = true
		$scope.embedVideo(1, $scope.CORRECT)
		expect($scope.questions[1].correct.value).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ')

		$scope.questions[1].correct.value = 'https://vimeo.com/148751763'
		$scope.questions[1].correct.videoValid = true
		$scope.embedVideo(1, $scope.CORRECT)
		expect($scope.questions[1].correct.value).toBe('https://player.vimeo.com/video/148751763')

		$scope.questions[1].correct.value = 'https://player.vimeo.com/video/148751763'
		$scope.questions[1].correct.videoValid = true
		$scope.embedVideo(1, $scope.CORRECT)
		expect($scope.questions[1].correct.value).toBe('https://player.vimeo.com/video/148751763')

		$scope.questions[1].correct.value = 'https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4'
		$scope.questions[1].correct.videoValid = true
		$scope.embedVideo(1, $scope.CORRECT)
		expect($scope.questions[1].correct.value).toBe('https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4')

		$scope.questions[1].correct.value = 'lul this is not a link'
		$scope.questions[1].correct.videoValid = true
		$scope.embedVideo(1, $scope.CORRECT)
		expect($scope.questions[1].correct.value).toBe('')

		$scope.questions[1].correct.value = $scope.questions[1].incorrect.value = 'this isnt actually a youtube link'
		$scope.questions[1].correct.videoValid = $scope.questions[1].incorrect.videoValid = true
		$scope.embedVideo(1, $scope.CORRECT)
		$scope.embedVideo(1, $scope.INCORRECT)
		expect($scope.questions[1].correct.videoValid).toBe(false)
		expect($scope.questions[1].incorrect.videoValid).toBe(false)
		expect($scope.questions[1].correct.value).toBe('')
		expect($scope.questions[1].incorrect.value).toBe('')

		$scope.questions[1].correct.value = $scope.questions[1].incorrect.value = 'this isnt actually a vimeo link'
		$scope.questions[1].correct.videoValid = $scope.questions[1].incorrect.videoValid = true
		$scope.embedVideo(1, $scope.CORRECT)
		$scope.embedVideo(1, $scope.INCORRECT)
		expect($scope.questions[1].correct.videoValid).toBe(false)
		expect($scope.questions[1].incorrect.videoValid).toBe(false)
		expect($scope.questions[1].correct.value).toBe('')
		expect($scope.questions[1].incorrect.value).toBe('')

		$scope.questions[1].correct.value = ''
		$scope.questions[1].correct.videoValid = true
		$scope.embedVideo(1, $scope.CORRECT)
		expect($scope.questions[1].correct.value).toBe('')
	})

	test('should import questions', () => {
		publicMethods.initNewWidget(widgetInfo)

		$scope.removeQuestion($scope.questions[0])
		expect($scope.questions.length).toBe(0)

		const items = widgetInfo.qset.data.items
		publicMethods.onQuestionImportComplete(items)

		expect($scope.questions.length).toBe(5)
		expect($scope.questions[0].title).toBe('Which of these paintings is from the Baroque period?')
		expect($scope.questions[2].title).toBe('Which one of these dogs is a Labrador Retriever?')
	})

	test('should import questions with answers that have no assets or options/feedback', () => {
		publicMethods.initNewWidget(widgetInfo)

		$scope.removeQuestion($scope.questions[0])
		expect($scope.questions.length).toBe(0)

		const items = widgetInfo.qset.data.items
		publicMethods.onQuestionImportComplete(items)

		expect($scope.questions.length).toEqual(5)

		let incomplete = [
			{
				id: null,
				questions: [{ text: 'Which one of these dogs is a Labrador Retriever?' }],
				answers: [{ options: {} }, { options: {} }]
			}
		]
	})

	test('should not import questions without answers', () => {
		publicMethods.initNewWidget(widgetInfo)

		$scope.removeQuestion($scope.questions[0])
		expect($scope.questions.length).toBe(0)

		const items = widgetInfo.qset.data.items
		publicMethods.onQuestionImportComplete(items)

		expect($scope.questions.length).toEqual(5)

		//first test - no answers
		let incomplete = [
			{
				id: null,
				questions: [{ text: 'Which one of these dogs is a Labrador Retriever?' }]
			}
		]

		publicMethods.onQuestionImportComplete(incomplete)
		expect($scope.questions.length).toEqual(5)
	})

	test('should alert when imported questions have problems', () => {
		publicMethods.initNewWidget(widgetInfo)

		global.Materia.CreatorCore.getMediaUrl = jest.fn(() => {
			throw 'testError'
		})
		global.window.alert = jest.fn()

		let incomplete = [
			{
				id: null,
				questions: [{ text: 'Which one of these dogs is a Labrador Retriever?' }],
				answers: [{ options: { asset: { id: null } } }, { options: { asset: { id: null } } }],
				options: { feedback: '' }
			}
		]
		publicMethods.onQuestionImportComplete(incomplete)

		expect(window.alert).toHaveBeenCalledWith(
			'Uh oh. Something went wrong with uploading your questions.'
		)
	})

	test('should init an existing widget', () => {
		publicMethods.initNewWidget(widgetInfo)

		$scope.questions = []

		publicMethods.initExistingWidget(widgetInfo.name, widgetInfo, qset.data)

		expect($scope.title).toEqual(widgetInfo.name)
		expect($scope.questions.length).toEqual(5)
	})
})
