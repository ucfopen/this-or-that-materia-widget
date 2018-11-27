describe('Creator Controller', function() {
	require('angular/angular.js')
	require('angular-animate/angular-animate.js')
	require('angular-sanitize/angular-sanitize.js')
	require('angular-mocks/angular-mocks.js')

	let $scope
	let $controller
	let $timeout
	let widgetInfo
	let qset
	let publicMethods

	function quickQuestion(givenID) {
		let title = 'test title ' + givenID
		let images = ['image 1', 'image 2']
		let imgsFilled = [false, false]
		let isValid = true
		let alt = ['alt 1', 'alt 2']
		let URLs = ['url 1', 'url 2']
		let id = '' + givenID
		let qid = '' + givenID
		let ansid = '' + givenID

		$scope.addQuestion(title, images, imgsFilled, isValid, alt, URLs, id, qid, ansid)
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
					return {title: title, qset: qset}
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

		// load the required code
		angular.mock.module('ThisOrThatCreator')
		require('./modules/creator.coffee')
		require('./creator.coffee')

		// mock scope
		$scope = {
			$apply: jest.fn().mockImplementation(fn => {
				fn ? fn() : null
			})
		}

		// initialize the angular controller
		inject(function(_$controller_, _$timeout_, _$sanitize_){
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
		defaultQuestion = {
			title: '',
			images: ['',''],
			isValid: true,
			alt: ['',''],
			URLs: ['assets/img/placeholder.png','assets/img/placeholder.png'],
			id: '',
			qid: '',
			ansid: ''
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

	test('should set the title when a title is input', () => {
		publicMethods.initNewWidget(widgetInfo)

		expect($scope.title).toBe('My This or That widget')

		$scope.introTitle = 'New This or That Title'
		$scope.setTitle()

		expect($scope.title).toBe('New This or That Title')
		expect($scope.dialog.intro).toBe(false)
		expect($scope.step).toBe(1)
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
		expect($scope.tutorial.step).toBeNull()
		$scope.tutorialIncrement(6)
		expect($scope.tutorial.step).toBeNull()
	})

	test('should fail validation when no questions are completed', () => {
		publicMethods.initNewWidget(widgetInfo)

		publicMethods.onSaveClicked('save')
		expect(Materia.CreatorCore.cancelSave).toHaveBeenCalledWith('Please make sure every question is complete')

		$scope.validation('change', 0)
		expect($scope.questions[0].invalid).toBe(true)
		expect($scope.dialog.invalid).toBe(true)
	})

	test('should pass validation when all questions are complete', () => {
		publicMethods.initNewWidget(widgetInfo)

		$scope.questions[0].title = 'question 1'
		$scope.questions[0].images = ['image 1', 'image 2']
		$scope.questions[0].alt = ['alt 1', 'alt 2']
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
		$scope.questions[0].images = ['image 1', 'image 2']
		$scope.questions[0].alt = ['alt 1', 'alt 2']
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
		expect($scope.questions[1].images).toEqual(['image 1', 'image 2'])
		expect($scope.questions[1].isValid).toBe(true)
		expect($scope.questions[1].alt).toEqual(['alt 1', 'alt 2'])
		expect($scope.questions[1].URLs).toEqual(['url 1', 'url 2'])
		expect($scope.questions[1].id).toBe('1')
		expect($scope.questions[1].qid).toBe('1')
		expect($scope.questions[1].ansid).toBe('1')
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

		let i = 1;
		while($scope.questions.length < 50) {
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
		let i = 1;
		while($scope.questions.length < 30) {
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
		let i = 1;
		while($scope.questions.length < 40) {
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
		let i = 1;
		while($scope.questions.length < 40) {
			quickQuestion(i++)
		}

		$scope.selectCurrent(30)
		expect($scope.actions.slideleft).toBe(true)
		$timeout.flush()
		expect($scope.currIndex).toBe(30)
	})

	test('should loop to the start when going next on the last question', () => {
		publicMethods.initNewWidget(widgetInfo)

		let i = 1;
		while($scope.questions.length < 50) {
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

		let i = 1;
		while($scope.questions.length < 50) {
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

		let i = 1;
		while($scope.questions.length < 49) {
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

		let i = 1;
		while($scope.questions.length < 50) {
			quickQuestion(i++)
		}

		expect($scope.questions.length).toBe(50)
		$scope.duplicate(0)
		expect($scope.questions.length).toBe(50)
		expect($scope.actions.add).toBe(false)
	})

	test('should remove a question', () => {
		publicMethods.initNewWidget(widgetInfo)

		let i = 1;
		while($scope.questions.length < 30) {
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

		$scope.clearImage(0, 0);
		expect($scope.questions[0].URLs[0]).toBe('http://placehold.it/300x250')
		expect($scope.questions[0].images[0]).toBeNull()
	})

	test('should correctly remove all questions', () => {
		publicMethods.initNewWidget(widgetInfo)

		let i = 1;
		while($scope.questions.length < 10) {
			quickQuestion(i++)
		}

		while($scope.questions.length > 0) {
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
		for(let i = 0; i < 500; i++) {
			expectedTitle += 'a'
		}

		let bigTitle = ''
		for(let i = 0; i < 520; i++) {
			bigTitle += 'a'
		}
		$scope.addQuestion()
		$scope.questions[0].title = bigTitle

		$scope.limitLength()
		expect($scope.questions[0].title).toBe(expectedTitle)
	})

	test('should set an image url', () => {
		publicMethods.initNewWidget(widgetInfo)

		quickQuestion(1)

		$scope.requestImage(0, 0)
		$scope.setURL('test url', 4)

		expect(Materia.CreatorCore.showMediaImporter).toHaveBeenCalled()

		expect($scope.questions[0].URLs[0]).toBe('test url')
		expect($scope.questions[0].images[0]).toBe(4)

		const media = [{id: 5}]
		publicMethods.onMediaImportComplete(media)

		expect($scope.questions[0].URLs[0]).toBe('MEDIA_URL/5')
		expect($scope.questions[0].images[0]).toBe(5)
	})

	test('should import questions', () => {
		publicMethods.initNewWidget(widgetInfo)

		$scope.removeQuestion($scope.questions[0])
		expect($scope.questions.length).toBe(0)

		const items = widgetInfo.qset.data.items
		publicMethods.onQuestionImportComplete(items)

		expect($scope.questions.length).toBe(3)
		expect($scope.questions[0].title).toBe('Which of these paintings is from the Baroque period?')
		expect($scope.questions[2].title).toBe('Which one of these dogs is a Labrador Retriever?')
	})

	test('should import questions with answers that have no assets or options/feedback', () => {
		publicMethods.initNewWidget(widgetInfo)

		$scope.removeQuestion($scope.questions[0])
		expect($scope.questions.length).toBe(0)

		const items = widgetInfo.qset.data.items
		publicMethods.onQuestionImportComplete(items)

		expect($scope.questions.length).toEqual(3)

		let incomplete = [
			{
				'id': null,
				'questions': [
					{ 'text': 'Which one of these dogs is a Labrador Retriever?' }
				],
				'answers': [
					{options: {}},
					{options: {}}
				]
			}
		]
	})

	test('should not import questions without answers', () => {
		publicMethods.initNewWidget(widgetInfo)

		$scope.removeQuestion($scope.questions[0])
		expect($scope.questions.length).toBe(0)

		const items = widgetInfo.qset.data.items
		publicMethods.onQuestionImportComplete(items)

		expect($scope.questions.length).toEqual(3)

		//first test - no answers
		let incomplete = [
			{
				'id': null,
				'questions': [
					{ 'text': 'Which one of these dogs is a Labrador Retriever?' }
				]
			}
		]

		publicMethods.onQuestionImportComplete(incomplete)
		expect($scope.questions.length).toEqual(3)
	})

	test('should alert when imported questions have problems', () => {
		publicMethods.initNewWidget(widgetInfo)

		global.Materia.CreatorCore.getMediaUrl = jest.fn(() => {
			throw 'testError'
		})
		global.window.alert = jest.fn()

		let incomplete = [
			{
				'id': null,
				'questions': [
					{ 'text': 'Which one of these dogs is a Labrador Retriever?' }
				],
				'answers': [
					{options: {asset: {id: null}}},
					{options: {asset: {id: null}}},
				]
			}
		]
		publicMethods.onQuestionImportComplete(incomplete)

		expect(window.alert).toHaveBeenCalledWith('Uh oh. Something went wrong with uploading your questions.')
	})

	test('should init an existing widget', () => {
		publicMethods.initNewWidget(widgetInfo)

		$scope.questions = []

		publicMethods.initExistingWidget(widgetInfo.name, widgetInfo, qset.data);

		expect($scope.title).toEqual(widgetInfo.name)
		expect($scope.questions.length).toEqual(3)
	})

})