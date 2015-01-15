###

Materia
It's a thing

Widget  : Flashquestions, Creator
Authors : Jonathan Warner, Brandon Stull, Micheal Parks
Updated : 5/14

###

# Create an angular module to import the animation module and house our controller
ThisOrThat = angular.module 'ThisOrThatCreator', ['ngAnimate', 'ngSanitize']

ThisOrThat.directive('ngEnter', ->
    return (scope, element, attrs) ->
        element.bind("keydown keypress", (event) ->
            if(event.which == 13)
                scope.$apply ->
                    scope.$eval(attrs.ngEnter)
                event.preventDefault()
        )
)
ThisOrThat.directive('focusMe', ['$timeout', '$parse', ($timeout, $parse) ->
	link: (scope, element, attrs) ->
		model = $parse(attrs.focusMe)
		scope.$watch model, (value) ->
			if value
				$timeout ->
					element[0].focus()
			value
])


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
		answers: [{
			text: item.alt[0]
			value: 100
			options:
				asset:
					materiaType: 'asset'
					id: item.images[0]
			}, {
			text: item.alt[1]
			value: 0
			options:
				asset:
					materiaType: 'asset'
					id: item.images[1]
			}
		]
]

# Set the controller for the scope of the document body.
ThisOrThat.controller 'ThisOrThatCreatorCtrl', ['$scope', '$sanitize', 'Resource',
($scope, $sanitize, Resource) ->
	$scope.title     = "My This or That widget"
	$scope.questions = []
	$scope.currIndex = 0
	_imgRef          = []

	# View actions
	$scope.setTitle = ->
		$scope.title = $scope.introTitle or $scope.title
		$scope.step  = 1
		$scope.hideCover()

	$scope.hideCover = ->
		$scope.showTitleDialog = $scope.showIntroDialog = false

	$scope.initNewWidget = (widget, baseUrl) ->
		$scope.$apply ->
			$scope.showIntroDialog = false
			$scope.addQuestion()
		

	$scope.initExistingWidget = (title, widget, qset, version, baseUrl) ->
		$scope.title = title
		$scope.onQuestionImportComplete qset.items

	$scope.onSaveClicked = (mode = 'save') ->
		# Create a qset to save
		qset = Resource.buildQset $sanitize($scope.title), $scope.questions
		if qset then Materia.CreatorCore.save $sanitize($scope.title), qset

	$scope.onSaveComplete = () -> true

	$scope.onQuestionImportComplete = (items) ->
		# Add each imported question to the DOM
		for i in [0..items.length-1]
			$scope.addQuestion items[i].questions[0].text.replace(/\&\#10\;/g, '\n'), [items[i].answers[0].options.asset.id, items[i].answers[1].options.asset.id], [items[i].answers[0].text, items[i].answers[1].text], ["", ""], items[i].id, items[i].questions[0].id, items[i].answers[0].id

			if items[i].answers?[0].options?.asset
				$scope.questions[i].URLs[0] = Materia.CreatorCore.getMediaUrl items[i].answers[0].options.asset.id

			if items[i].answers?[1].options?.asset
				$scope.questions[i].URLs[1] = Materia.CreatorCore.getMediaUrl items[i].answers[1].options.asset.id
		
		$scope.$apply()

	$scope.onMediaImportComplete = (media) ->
		$scope.setURL Materia.CreatorCore.getMediaUrl(media[0].id), media[0].id
		$scope.$apply()

	$scope.addQuestion = (title = "", images = ["",""], alt = ["",""], URLs = ["http://placehold.it/300x250","http://placehold.it/300x250"], answers = "", id = "", qid = "", ansid = "") ->
		$scope.questions.push { title: title, images: images, alt: alt, URLs: URLs, answers: answers, id: id, qid: qid, ansid: ansid }

	$scope.removeQuestion = (index) ->
		$scope.questions.splice index, 1

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

	$scope.next = () ->
		if $scope.currIndex < $scope.questions.length - 1 then $scope.currIndex++ else index_ = 0

	$scope.prev = () ->
		if $scope.currIndex > 0 then $scope.currIndex-- else $scope.currIndex = $scope.questions.length - 1;

	$scope.updateDong = (index) ->
		$scope.currIndex = index

	Materia.CreatorCore.start $scope
]

