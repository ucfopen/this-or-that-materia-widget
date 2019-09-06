# Create an angular module to import the animation module and house our controller
ThisOrThat = angular.module 'ThisOrThatCreator'

# The 'Resource' service contains all app logic that does pertain to DOM manipulation
ThisOrThat.factory 'Resource', ['$sanitize',($sanitize) ->
	buildQset: (title, items, isRandom) ->
		qsetItems = []
		qset      = {}
		qset.options = {}

		# Decide if it is ok to save
		if title is ''
			Materia.CreatorCore.cancelSave 'Please enter a title.'
			return false

		for item in items
			processedItem = @processQsetItem item
			qsetItems.push processedItem if processedItem

		qset.items = qsetItems
		qset.options.randomizeOrder = isRandom
		qset

	processQsetItem: (item) ->
		# Remove any dangerous content
		item.ques = $sanitize item.title

		materiaType: "question"
		id: item.id
		type: 'MC'
		questions: [{ text: item.ques }]
		answers: [
			text: item.alt[0]
			value: 100
			options:
				asset:
					materiaType: 'asset'
					id: item.images[0]
		,
			text: item.alt[1]
			value: 0
			options:
				asset:
					materiaType: 'asset'
					id: item.images[1]
		],
		options:
			feedback: item.alt[2]
]


# Set the controller for the scope of the document body.
ThisOrThat.controller 'ThisOrThatCreatorCtrl', ['$scope','$timeout','$sanitize', 'Resource',($scope, $timeout, $sanitize, Resource) ->
	$scope.title      = "My This or That widget"
	$scope.randomizeOrder = false
	$scope.questions  = []
	$scope.currIndex  = -1
	$scope.dialog     = {}
	$scope.tutorial   = { checked: false, step: 1, text: ["Enter a question", "Upload the correct image", "Describe the correct image", "Upload the incorrect image", "Describe the incorrect image", "Add more questions!"] }
	$scope.actions    = { slidein: false, slideleft: false, slideright: false, add: false, remove: false, removelast: false }
	_imgRef           = []

	materiaCallbacks = {}

	materiaCallbacks.initNewWidget = (widget, baseUrl) ->
		$scope.$apply ->
			$scope.dialog.intro  = true
			$scope.addQuestion()

	materiaCallbacks.initExistingWidget = (title, widget, qset, version, baseUrl) ->
		$scope.title = title
		$scope.tutorial.step = null
		materiaCallbacks.onQuestionImportComplete qset.items

	materiaCallbacks.onSaveClicked = (mode = 'save') ->
		_isValid = $scope.validation('save')

		if _isValid
			# Create a qset to save
			qset = Resource.buildQset $sanitize($scope.title), $scope.questions, $scope.randomizeOrder
			if qset then Materia.CreatorCore.save $sanitize($scope.title), qset, 2
		else
			Materia.CreatorCore.cancelSave "Please make sure every question is complete"

			return false

	materiaCallbacks.onSaveComplete = () -> true

	materiaCallbacks.onQuestionImportComplete = (items) ->
		for item in items
			_ids = []
			_urls = []

			if !item.questions or !item.answers then return

			# gets the image URLs
			try
				if item.answers and item.answers[0] and item.answers[0].options and item.answers[0].options.asset
					_ids[0] = item.answers[0].options.asset.id
					_urls[0] = Materia.CreatorCore.getMediaUrl item.answers[0].options.asset.id
				if item.answers and item.answers[1] and item.answers[1].options and item.answers[1].options.asset
					_ids[1] = item.answers[1].options.asset.id
					_urls[1] = Materia.CreatorCore.getMediaUrl item.answers[1].options.asset.id
			catch error
				alert 'Uh oh. Something went wrong with uploading your questions.'
				return

			# Add each imported question to the DOM
			$scope.questions.push
				title: item.questions[0].text.replace(/\&\#10\;/g, '\n')
				images: _ids
				isValid: true
				alt: [item.answers[0].text, item.answers[1].text, item.options?.feedback or '']
				URLs: _urls
				id: item.id
				qid: item.questions[0].id
				ansid: item.answers[0].id

		$scope.currIndex = 0
		$scope.$apply()

	materiaCallbacks.onMediaImportComplete = (media) ->
		$scope.setURL Materia.CreatorCore.getMediaUrl(media[0].id), media[0].id
		$scope.$apply()

	_noTransition = ->
		for action of $scope.actions
			if action != 'activate' then $scope.actions[action] = false

	_updateIndex = (action, data) ->
		switch action
			when 'prev'
				if $scope.currIndex > 0 then $scope.currIndex-- else $scope.currIndex = $scope.questions.length - 1
			when 'next'
				if $scope.currIndex < $scope.questions.length - 1 then $scope.currIndex++ else $scope.currIndex = 0
			when 'select'
				$scope.currIndex = data
			when 'add'
				$scope.questions.push data
				$scope.currIndex = $scope.questions.length - 1
			when 'remove'
				$scope.currIndex--

	# View actions
	$scope.duplicate = (index) ->
		if $scope.questions.length < 50
			$scope.actions.add = true
			$timeout _noTransition, 660, true

			$timeout ->
				_updateIndex 'add', angular.copy($scope.questions[index])
			, 200, true

	$scope.setTitle = ->
		if $scope.title
			$scope.title = $scope.introTitle or $scope.title
			$scope.dialog.intro = $scope.dialog.edit = false
			$scope.step = 1

	$scope.addQuestion = (title = "", images = ["",""], imgsFilled = [false, false], isValid = true, alt = ["",""], URLs = ["assets/img/placeholder.png","assets/img/placeholder.png"], id = "", qid = "", ansid = "") ->
		if $scope.questions.length > 0
			if $scope.questions.length < 50
				$scope.actions.add = true
				$timeout _noTransition, 660, true

				$timeout ->
					_updateIndex 'add', { title: title, images: images, isValid: isValid, alt: alt, URLs: URLs, id: id, qid: qid, ansid: ansid }
				, 200, true
		else
			$scope.questions.push
				title: title
				images: images
				isValid: isValid
				alt: alt
				URLs: URLs
				id: id
				qid: qid
				ansid: ansid

			$scope.currIndex = $scope.questions.length - 1

	$scope.removeQuestion = (index) ->
		if $scope.currIndex + 1 == $scope.questions.length then $scope.actions.removelast = true else $scope.actions.remove = true

		$timeout _noTransition, 660, true
		$scope.questions.splice index, 1

		if $scope.currIndex == $scope.questions.length
			$timeout ->
				_updateIndex 'remove'
			, 200, true

	$scope.requestImage = (index, which) ->
		Materia.CreatorCore.showMediaImporter()
		# Save the image and which choice it's for
		_imgRef[0] = index
		_imgRef[1] = which

		$scope.validation 'change', index

	$scope.setURL = (URL, id) ->
		# Bind the image URL to the DOM
		$scope.questions[_imgRef[0]].URLs[_imgRef[1]]   = URL
		$scope.questions[_imgRef[0]].images[_imgRef[1]] = id

	$scope.clearImage = (index, which) ->
		$scope.questions[index].URLs[which] = "http://placehold.it/300x250"
		$scope.questions[index].images[which] = null
		$scope.$apply()

	$scope.next = ->
		$scope.actions.slideright = true

		$timeout ->
			_updateIndex 'next'
		, 200, true

		$timeout _noTransition, 660, true

	$scope.prev = ->
		$scope.actions.slideleft = true

		$timeout ->
			_updateIndex 'prev'
		, 200, true

		$timeout _noTransition, 660, true

	$scope.selectCurrent = (index) ->
		if index > $scope.currIndex then $scope.actions.slideright = true
		if index < $scope.currIndex then $scope.actions.slideleft = true

		$timeout ->
			_updateIndex 'select', index
		, 200, true

		$timeout _noTransition, 660, true

	$scope.tutorialIncrement = (step) ->
		if $scope.tutorial.step > 0
			switch step
				when 1
					if $scope.tutorial.step is 1 then $scope.tutorial.step++
				when 2
					if $scope.tutorial.step is 2 then $scope.tutorial.step++
				when 3
					if $scope.tutorial.step is 3 then $scope.tutorial.step++
				when 4
					if $scope.tutorial.step is 4 then $scope.tutorial.step++
				when 5
					if $scope.tutorial.step is 5 then $scope.tutorial.step++
				when 6
					if $scope.tutorial.step is 6 then $scope.tutorial.step = null
		else return false

	$scope.limitLength = ->
		$scope.questions[$scope.currIndex].title = $scope.questions[$scope.currIndex].title.substring(0, 500)

	$scope.validation = (action, which) ->
		switch action
			when 'save'
				for q in $scope.questions
					if !q.title or !q.alt[0] or !q.alt[1] or !q.images[0] or !q.images[1]
						q.invalid = true
						$scope.dialog.invalid       = true
						$scope.$apply()
				if $scope.dialog.invalid then return false else return true
			when 'change'
				if $scope.questions[which].title and $scope.questions[which].alt[0] and $scope.questions[which].alt[1] and $scope.questions[which].images[0] and $scope.questions[which].images[1]
					$scope.questions[which].invalid = false

	$scope.hideModal = ->
		$scope.dialog.invalid = $scope.dialog.edit = $scope.dialog.intro = false

	Materia.CreatorCore.start materiaCallbacks

]
