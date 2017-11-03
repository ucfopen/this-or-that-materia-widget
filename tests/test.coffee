describe 'ThisOrThatEngine module', ->

	# grab the demo widget for easy reference
	widgetInfo = window.__demo__['build/demo']
	qset = widgetInfo.qset

	$scope = {}
	ctrl = {}

	describe 'ThisOrThatEngineCtrl', ->
		# Grab the 'ThisOrThatEngine' module for use in upcoming tests
		module.sharedInjector()
		beforeAll(module('ThisOrThatEngine'))

		# Set up the controller/scope prior to these tests
		beforeAll inject ($rootScope, $controller) ->
			# Instantiate $scope with all of the generic $scope methods/properties
			$scope = $rootScope.$new()

			# Pass $scope through the 'ThisOrThatEngineCtrl' controller
			ctrl = $controller('ThisOrThatEngineCtrl', { $scope: $scope })

		beforeEach ->
			# Spy on Materia.Engine.end()
			spyOn(Materia.Engine, 'end')
			# Spy on Materia.Engine.getImageAssetUrl()
			spyOn(Materia.Engine, 'getImageAssetUrl')
			# Spy on Materia.Engine.setHeight()
			spyOn(Materia.Engine, 'setHeight')

		it 'should start the game correctly', ->
			$scope.start(widgetInfo, qset.data)
			expect(Materia.Engine.getImageAssetUrl).toHaveBeenCalled()

		it 'should start the game with the first question', ->
			expect($scope.questions.current).toEqual(0)
			expect($scope.title)
				.toEqual('Which of these paintings is from the Baroque period?')
			expect($scope.answers.length).toEqual(2)
			expect($scope.answers).toContain(jasmine.objectContaining(
				{ text: 'The Mona Lisa by Leonardo DaVinci' }
			))
			expect($scope.answers).toContain(jasmine.objectContaining(
				{ text: 'The Fall of Phaeton by Peter Paul Rubens' }
			))
			expect($scope.questions.selected).toEqual(false)
			expect($scope.questions.transition).toEqual(false)

		it 'should check the answer choice', ->
			# The answer choices are randomized, so to ensure we test this properly
			# I just set the first answer to correct
			$scope.answers[0].value = 100
			$scope.checkChoice(0)

			expect($scope.questions.correct[0]).toEqual('Correct!')

			$scope.answers[1].value = 0
			$scope.checkChoice(1)

			expect($scope.questions.correct[1]).toEqual('Incorrect')
			expect($scope.questions.selected).toEqual(true)
			expect($scope.gameState.showNext).toEqual(true)

		it 'should update when next is clicked', ->
			$scope.nextClicked()
			expect($scope.gameState.showNext).toEqual(false)
			expect($scope.questions.correct).toEqual(['', ''])
			expect($scope.questions.choice).toEqual(-1)
			expect($scope.questions.transition).toEqual(true)
			expect($scope.hands.thisRaised).toEqual(false)
			expect($scope.hands.thatRaised).toEqual(false)

		it 'should be in game after the intro closes', ->
			$scope.closeIntro()
			expect($scope.gameState.ingame).toEqual(true)

		it 'should end the game when all questions are done', inject ($timeout) ->
			$scope.questions.current = 100
			$scope.nextClicked()

			# There are two $timeouts that are called, so $timeout must be flushed
			# twice
			$timeout.flush()
			$timeout.flush()
			$timeout.verifyNoPendingTasks()

			expect(Materia.Engine.end).toHaveBeenCalled()
			expect($scope.title).toBeFalsy()

		it 'should update the height after closing the intro', inject ($timeout) ->
			$scope.closeIntro()

			$timeout.flush()
			$timeout.verifyNoPendingTasks()

			expect(Materia.Engine.setHeight).toHaveBeenCalled()

		it 'should return from randomizing when there are no answers', ->
			_qset =
				data:
					items: [
						{
							questions: [
								{
									text: 'test'
								}
							]
							answers: []
						}
					]

			$scope.questions.current = -1
			$scope.start(widgetInfo, _qset.data)

		it 'should end the game when viewing scores', ->
			$scope.viewScores()
			expect(Materia.Engine.end).toHaveBeenCalled()

	describe 'ThisOrThatCreator module', ->

		# Grab the 'ThisOrThatCreator' module for use in upcoming tests
		module.sharedInjector()
		beforeAll(module('ThisOrThatCreator'))

		# Set up the controller/scope prior to these tests
		beforeAll inject ($rootScope, $controller) ->
			# Instantiate $scope with all of the generic $scope methods/properties
			$scope = $rootScope.$new()
			# Pass $scope through the 'ThisOrThatCreatorCtrl' controller
			ctrl = $controller('ThisOrThatCreatorCtrl', { $scope: $scope })

		beforeEach ->
			# Lets us check which arguments are passed to this function when its called
			spyOn(Materia.CreatorCore, 'alert').and.callThrough()
			spyOn(Materia.CreatorCore, 'save').and.callFake((title, qset) ->
				# The creator core calls this on the creator when saving is successful
				$scope.onSaveComplete()
				return { title: title, qset: qset }
			)
			spyOn(Materia.CreatorCore, 'cancelSave').and.callThrough()
			spyOn(Materia.CreatorCore, 'showMediaImporter').and.callThrough()
			spyOn(Materia.CreatorCore, 'getMediaUrl').and.callFake((media) ->
				return 'placeholder'
			)

		it 'should edit a new widget', ->
			defaultQuestion =
				title : '',
				images : ['',''],
				isValid : true,
				alt : ['',''],
				URLs : ['assets/img/placeholder.png','assets/img/placeholder.png'],
				id : '',
				qid : '',
				ansid : ''

			$scope.initNewWidget(widgetInfo)
			expect($scope.title).toEqual('My This or That widget')
			expect($scope.dialog.intro).toEqual(true)

			# The only question should be the default one created on init
			expect($scope.questions).toEqual([defaultQuestion])

			# The creator has a check for activate, unsure where it could come from
			# though. This line is for coverage.
			$scope.actions.activate = false

		it 'should set the default title when no title is input', ->
			$scope.setTitle()
			expect($scope.title).toEqual('My This or That widget')
			expect($scope.dialog.intro).toEqual(false)
			expect($scope.step).toEqual(1)

		it 'should set the title when a title is input', ->
			$scope.introTitle = 'New This or That Title'
			$scope.setTitle()
			expect($scope.title).toEqual('New This or That Title')
			expect($scope.dialog.intro).toEqual(false)
			expect($scope.step).toEqual(1)

		it 'should increment the tutorial correctly', ->
			expect($scope.tutorial.step).toEqual(1)

			$scope.tutorialIncrement(1)
			expect($scope.tutorial.step).toEqual(2)
			$scope.tutorialIncrement(1)
			expect($scope.tutorial.step).toEqual(2)
			$scope.tutorialIncrement(6)
			expect($scope.tutorial.step).toEqual(2)

			$scope.tutorialIncrement(2)
			expect($scope.tutorial.step).toEqual(3)
			$scope.tutorialIncrement(2)
			expect($scope.tutorial.step).toEqual(3)

			$scope.tutorialIncrement(3)
			expect($scope.tutorial.step).toEqual(4)
			$scope.tutorialIncrement(3)
			expect($scope.tutorial.step).toEqual(4)

			$scope.tutorialIncrement(4)
			expect($scope.tutorial.step).toEqual(5)
			$scope.tutorialIncrement(4)
			expect($scope.tutorial.step).toEqual(5)

			$scope.tutorialIncrement(5)
			expect($scope.tutorial.step).toEqual(6)
			$scope.tutorialIncrement(5)
			expect($scope.tutorial.step).toEqual(6)

			$scope.tutorialIncrement(6)
			expect($scope.tutorial.step).toBeNull()
			$scope.tutorialIncrement(6)
			expect($scope.tutorial.step).toBeNull()

		it 'should fail validation when no questions are completed', ->
			$scope.onSaveClicked('save')
			expect(Materia.CreatorCore.cancelSave)
				.toHaveBeenCalledWith('Please make sure every question is complete')

			$scope.validation('change', 0)
			expect($scope.questions[0].invalid).toBeTruthy()
			expect($scope.dialog.invalid).toBeTruthy()

		it 'should pass validation when all questions are complete', ->
			$scope.questions[0].title = 'question 1'
			$scope.questions[0].images = ['image 1', 'image 2']
			$scope.questions[0].alt = ['alt 1', 'alt 2']
			$scope.dialog.invalid = false

			$scope.validation('change', 0)
			expect($scope.questions[0].invalid).toBeFalsy()

			$scope.onSaveClicked()
			expect(Materia.CreatorCore.save).toHaveBeenCalled()

		it 'should not save without a title', ->
			$scope.title = ''
			$scope.onSaveClicked()

			expect(Materia.CreatorCore.cancelSave)
				.toHaveBeenCalledWith('Please enter a title.')

		it 'should add a new question', inject ($timeout) ->
			expect($scope.questions.length).toEqual(1)

			$scope.addQuestion()
			$timeout.flush()
			$timeout.verifyNoPendingTasks()

			expect($scope.questions.length).toEqual(2)

		it 'should add a new question with given parameters', inject ($timeout) ->
			expect($scope.questions.length).toEqual(2)

			title = 'test title'
			images = ['image 1', 'image 2']
			imgsFilled = [false, false]
			isValid = true
			alt = ['alt 1', 'alt 2']
			URLs = ['url 1', 'url 2']
			id = '1'
			qid = '1'
			ansid = '1'

			$scope.addQuestion(title, images, imgsFilled, isValid, alt, URLs, id,
				qid, ansid)
			$timeout.flush()
			$timeout.verifyNoPendingTasks()

			expect($scope.questions.length).toEqual(3)
			expect($scope.questions[2].title).toEqual('test title')
			expect($scope.questions[2].images).toEqual(['image 1', 'image 2'])
			expect($scope.questions[2].isValid).toEqual(true)
			expect($scope.questions[2].alt).toEqual(['alt 1', 'alt 2'])
			expect($scope.questions[2].URLs).toEqual(['url 1', 'url 2'])
			expect($scope.questions[2].id).toEqual('1')
			expect($scope.questions[2].qid).toEqual('1')
			expect($scope.questions[2].ansid).toEqual('1')

		it 'should slide left when selecting the previous question',
			inject ($timeout) ->
				$scope.prev()
				expect($scope.actions.slideleft).toBeTruthy()
				$timeout.flush()
				$timeout.verifyNoPendingTasks()

				expect($scope.currIndex).toEqual(1)
				expect($scope.actions.slideleft).toBeFalsy()

		it 'should slide right when selecting the next question',
			inject ($timeout) ->
				$scope.next()
				expect($scope.actions.slideright).toBeTruthy()
				$timeout.flush()
				$timeout.verifyNoPendingTasks()

				expect($scope.currIndex).toEqual(2)
				expect($scope.actions.slideright).toBeFalsy()

		it 'should not add any new questions after 50', inject ($timeout) ->
			while($scope.questions.length != 50)
				$scope.addQuestion()
				$timeout.flush()
				$timeout.verifyNoPendingTasks()

			expect($scope.questions.length).toEqual(50)

			# There won't be any tasks to flush because the code won't ever reach the
			# point to add another question through the timeout.
			$scope.addQuestion()
			expect($scope.questions.length).toEqual(50)

		it 'should move to a specific index', inject ($timeout) ->
			$scope.selectCurrent(25)
			$timeout.flush()
			$timeout.verifyNoPendingTasks()
			expect($scope.currIndex).toEqual(25)

		it 'should move right when selecting a higher index', inject ($timeout) ->
			$scope.selectCurrent(26)
			expect($scope.actions.slideright).toBeTruthy()

			$timeout.flush()
			$timeout.verifyNoPendingTasks()

			expect($scope.currIndex).toEqual(26)
			expect($scope.actions.slideright).toBeFalsy()

		it 'should move left when selecting a lower index', inject ($timeout) ->
			$scope.selectCurrent(24)
			expect($scope.actions.slideleft).toBeTruthy()

			$timeout.flush()
			$timeout.verifyNoPendingTasks()

			expect($scope.currIndex).toEqual(24)
			expect($scope.actions.slideleft).toBeFalsy()

		it 'should loop back to the start when going next on the last question',
			inject ($timeout) ->
				$scope.selectCurrent(49)
				$timeout.flush()
				$timeout.verifyNoPendingTasks()
				expect($scope.currIndex).toEqual(49)

				$scope.next()
				$timeout.flush()
				$timeout.verifyNoPendingTasks()
				expect($scope.currIndex).toEqual(0)

		it 'should loop to the end when going prev on the first question',
			inject ($timeout) ->
				expect($scope.currIndex).toEqual(0)
				$scope.prev()
				$timeout.flush()
				$timeout.verifyNoPendingTasks()
				expect($scope.currIndex).toEqual(49)

		it 'should not duplicate a question when there are 50 questions', ->
			expect($scope.questions.length).toEqual(50)
			$scope.duplicate(0)
			expect($scope.questions.length).toEqual(50)
			expect($scope.actions.add).toBeFalsy()

		it 'should remove a question', inject ($timeout) ->
			$scope.selectCurrent(25)
			$timeout.flush()
			$timeout.verifyNoPendingTasks()

			$scope.questions[25].title = 'question 26'
			$scope.questions[26].title = 'question 27'

			expect($scope.questions[25].title).toEqual('question 26')

			$scope.removeQuestion(25)

			expect($scope.questions[25].title).toEqual('question 27')

		it 'should duplicate a question when there are less than 50',
			inject ($timeout) ->
				expect($scope.currIndex).toEqual(25)
				expect($scope.questions.length).toEqual(49)
				$scope.duplicate(25)

				$timeout.flush()
				$timeout.verifyNoPendingTasks()

				expect($scope.questions.length).toEqual(50)
				expect($scope.questions[49].title).toEqual('question 27')
				expect($scope.currIndex).toEqual(49)

		it 'should remove an image', ->
			$scope.clearImage(0, 0);
			expect($scope.questions[0].URLs[0]).toEqual('http://placehold.it/300x250')
			expect($scope.questions[0].images[0]).toBeNull()

		it 'should correctly remove all questions', inject ($timeout) ->
			while($scope.questions.length > 0)
				$scope.removeQuestion($scope.questions[0])

			expect($scope.actions.removelast).toBeTruthy()

			$timeout.flush()
			$timeout.verifyNoPendingTasks()

			expect($scope.questions.length).toEqual(0)

		it 'should hide the modal', ->
			$scope.hideModal()
			expect($scope.dialog.invalid).toBeFalsy()
			expect($scope.dialog.edit).toBeFalsy()
			expect($scope.dialog.intro).toBeFalsy()

		it 'should limit titles to 500 characters', ->
			$scope.addQuestion()
			$scope.questions[0].title = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' +
					'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' +
					'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' +
					'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' +
					'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' +
					'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' +
					'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' +
					'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaab'
			$scope.limitLength()

			expect($scope.questions[0].title).toEqual('aaaaaaaaaaaaaaaaaaaaaaaaaaaa' +
					'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' +
					'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' +
					'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' +
					'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' +
					'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' +
					'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' +
					'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' +
					'aaaaaaaaaa')

		it 'should set an image url', ->
			$scope.requestImage(0, 0)
			$scope.setURL('test url', 4)

			expect($scope.questions[0].URLs[0]).toEqual('test url')
			expect($scope.questions[0].images[0]).toEqual(4)

		it 'should set an image url on media import complete', ->
			media = [{id: 5}]
			$scope.onMediaImportComplete(media)

			expect($scope.questions[0].URLs[0]).toEqual('placeholder')
			expect($scope.questions[0].images[0]).toEqual(5)

		it 'should call a function after enter has been pressed on an element with ng-enter',
			inject ($compile) ->
				htmlElement = '<input type="text" ng-enter="setTitle()">'
				element = $compile(htmlElement)($scope)

				spyOn($scope, 'setTitle').and.callThrough()

				e = angular.element.Event('keypress')
				e.which = 13

				element.trigger(e)
				expect($scope.setTitle).toHaveBeenCalled()

		it 'should not call a function after a non-enter key press on an element with ng-enter',
			inject ($compile) ->
				htmlElement = '<input type="text" ng-enter="setTitle()">'
				element = $compile(htmlElement)($scope)

				spyOn($scope, 'setTitle').and.callThrough()

				e = angular.element.Event('keypress')
				e.which = 12

				element.trigger(e)
				expect($scope.setTitle).not.toHaveBeenCalled()

		it 'should focus an element with focus-me',
			inject ($compile, $timeout) ->
				htmlElement = '<input type="text" focus-me="dialog.edit">'
				element = $compile(htmlElement)($scope)
				spyOn(element[0], 'focus')

				$scope.dialog.edit = true
				$scope.$digest()

				$timeout.flush()
				$timeout.verifyNoPendingTasks()

				expect(element[0].focus).toHaveBeenCalled()

		it 'should not focus an element with focus-me when passed false',
			inject ($compile) ->
				htmlElement = '<input type="text" focus-me="dialog.edit">'
				element = $compile(htmlElement)($scope)
				spyOn(element[0], 'focus')

				$scope.dialog.edit = false
				$scope.$digest()

				expect(element[0].focus).not.toHaveBeenCalled()

		it 'should import questions', ->
			while($scope.questions.length > 0)
				$scope.removeQuestion($scope.questions[0])

			expect($scope.questions.length).toEqual(0)

			items = widgetInfo.qset.data.items

			$scope.onQuestionImportComplete(items)

			expect($scope.questions.length).toEqual(3)
			expect($scope.questions[0].title).toEqual(
				'Which of these paintings is from the Baroque period?')
			expect($scope.questions[2].title).toEqual(
				'Which one of these dogs is a Labrador Retriever?')

		it 'should not import incomplete questions', ->
			expect($scope.questions.length).toEqual(3)

			incomplete = [
				'id': null
				'questions': [
					{ 'text': 'Which one of these dogs is a Labrador Retriever?' }
				]
			]

			$scope.onQuestionImportComplete(incomplete)
			expect($scope.questions.length).toEqual(3)

		it 'should init an existing widget', ->
			$scope.questions = []

			$scope.initExistingWidget(widgetInfo.name, widgetInfo, qset.data);

			expect($scope.title).toEqual(widgetInfo.name)
			expect($scope.questions.length).toEqual(3)
