###

Materia
It's a thing

Widget  : This or That, Creator
Authors : Eric Colon
Updated : 1/20/2014

###

# Create an angular module to import the animation module and house our controller
ThisOrThat = angular.module 'ThisOrThatCreator', ['ngAnimate', 'ngSanitize']

# The 'Resource' service contains all app logic that does pertain to DOM manipulation
ThisOrThat.factory 'Resource', ['$sanitize', ($sanitize) ->
	buildQset: (title, items) ->
		qsetItems = []
		qset      = {}

		# Decide if it is ok to save
		if title is ''
			Materia.CreatorCore.cancelSave 'Please enter a title.'
			return false

		for i in [0..items.length-1]
			item = @processQsetItem items[i]
			qsetItems.push item if item

		qset.items = qsetItems

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
		]
]

# Set the controller for the scope of the document body.
ThisOrThat.controller 'ThisOrThatCreatorCtrl', ['$scope', '$timeout', '$sanitize', 'Resource',
($scope, $timeout, $sanitize, Resource) ->
	$scope.title      = "My This or That widget"
	$scope.questions  = []
	$scope.currIndex  = -1
	$scope.actions    = { slidein: false, slideleft: false, slideright: false, add: false, remove: false, removelast: false }
	_imgRef           = []

	# View actions
	$scope.setTitle = ->
		$scope.title = $scope.introTitle or $scope.title
		$scope.step  = 1
		$scope.hideCover()

	$scope.hideCover = ->
		$scope.showIntroDialog = false

	$scope.initNewWidget = (widget, baseUrl) ->
		$scope.$apply ->
			$scope.showIntroDialog = false
			$scope.addQuestion()

	$scope.initExistingWidget = (title, widget, qset, version, baseUrl) ->
		$scope.title = title
		$scope.onQuestionImportComplete qset.items

	$scope.onSaveClicked = (mode = 'save') ->
		for i in [0..$scope.questions.length-1]
			if !$scope.questions[i].title or !$scope.questions[i].alt[0] or !$scope.questions[i].alt[1] or !$scope.questions[i].images[0] or !$scope.questions[i].images[1]
				$scope.questions[i].invalid = true
				$scope.showInvalidDialog    = true
				$scope.$apply()
			else
				if $scope.questions[i].invalid then $scope.questions[i].invalid = false
				# Create a qset to save
				qset = Resource.buildQset $sanitize($scope.title), $scope.questions
				if qset then Materia.CreatorCore.save $sanitize($scope.title), qset

	$scope.onSaveComplete = () -> true

	$scope.onQuestionImportComplete = (items) ->
		for i in [0..items.length-1]
			_urls = []

			# gets the image URLs
			if items[i].answers?[0].options?.asset
				_urls[0] = Materia.CreatorCore.getMediaUrl items[i].answers[0].options.asset.id

			if items[i].answers?[1].options?.asset
				_urls[1] = Materia.CreatorCore.getMediaUrl items[i].answers[1].options.asset.id

			# Add each imported question to the DOM
			$scope.addQuestion items[i].questions[0].text.replace(/\&\#10\;/g, '\n'), [items[i].answers[0].options.asset.id, items[i].answers[1].options.asset.id], [items[i].answers[0].text, items[i].answers[1].text], _urls, items[i].id, items[i].questions[0].id, items[i].answers[0].id

	$scope.onMediaImportComplete = (media) ->
		$scope.setURL Materia.CreatorCore.getMediaUrl(media[0].id), media[0].id
		$scope.$apply()

	$scope.addQuestion = (title = "", images = ["",""], alt = ["",""], URLs = ["assets/img/placeholder.png","assets/img/placeholder.png"], answers = [], id = "", qid = "", ansid = "") ->
		if $scope.questions.length > 0
			$scope.actions.add = true
			$timeout _noTransition, 660, true

			$timeout ->
					$scope.questions.push { title: title, images: images, alt: alt, URLs: URLs, answers: answers, id: id, qid: qid, ansid: ansid }
					$scope.currIndex = $scope.questions.length - 1
					330
					true
		else
			$scope.questions.push { title: title, images: images, alt: alt, URLs: URLs, answers: answers, id: id, qid: qid, ansid: ansid }
			$scope.currIndex = $scope.questions.length - 1

	$scope.removeQuestion = (index) ->
		if $scope.currIndex + 1 == $scope.questions.length then $scope.actions.removelast = true else $scope.actions.remove = true

		$timeout _noTransition, 660, true
		$scope.questions.splice index, 1

		if $scope.currIndex == $scope.questions.length
			$timeout ->
					$scope.currIndex--
					330
					true

	$scope.requestImage = (index, which) ->
		Materia.CreatorCore.showMediaImporter()
		# Save the image and which choice it's for
		_imgRef[0] = index
		_imgRef[1] = which

	$scope.setURL = (URL, id) ->
		# Bind the image URL to the DOM
		$scope.questions[_imgRef[0]].URLs[_imgRef[1]]   = URL
		$scope.questions[_imgRef[0]].images[_imgRef[1]] = id

	$scope.clearImage = (index, which) ->
		$scope.questions[index].URLs[which] = "http://placehold.it/300x250"

	$scope.next = ->
		$scope.actions.slideright = true

		if $scope.currIndex < $scope.questions.length - 1
			$timeout ->
					$scope.currIndex++
					330
					true
		else
			$timeout ->
					$scope.currIndex = 0
					330
					true

		$timeout _noTransition, 660, true

	$scope.prev = ->
		$scope.actions.slideleft = true

		if $scope.currIndex > 0
			$timeout ->
					$scope.currIndex--
					330
					true
		else
			$timeout ->
					$scope.currIndex = $scope.questions.length - 1
					330
					true

		$timeout _noTransition, 660, true

	$scope.selectCurrent = (index) ->
		if index > $scope.currIndex then $scope.actions.slideright = true
		if index < $scope.currIndex then $scope.actions.slideleft = true

		$timeout ->
				$scope.currIndex = index
				330
				true
		$timeout _noTransition, 660, true

	_noTransition = ->
		for action of $scope.actions
			if action != 'activate' then $scope.actions[action] = false

	Materia.CreatorCore.start $scope
]

