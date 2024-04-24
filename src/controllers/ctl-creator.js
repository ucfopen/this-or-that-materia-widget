export const ControllerThisOrThatCreator = function($scope, $timeout, $sanitize, CreatorService, $sce) {
	$scope.title = 'My This or That widget'
	$scope.randomizeOrder = false
	$scope.questions = []
	$scope.currIndex = -1
	$scope.dialog = {}
	$scope.questionBankModal = false
	$scope.enableQuestionBank = false
	$scope.questionBankValTemp = 1
	$scope.questionBankVal = 1
	$scope.tutorial = {
		checked: false,
		step: 1,
		text: [
			'Enter a question',
			'Pick the answer type',
			'CORRECT_ITEM_SELECT',
			'CORRECT_ITEM_DESCRIPTION',
			'Pick the answer type',
			'INCORRECT_ITEM_SELECT',
			'INCORRECT_ITEM_DESCRIPTION',
			'Add another question'
		]
	}
	$scope.actions = {
		slidein: false,
		slideleft: false,
		slideright: false,
		add: false,
		remove: false,
		removelast: false
	}

	const _assetRef = {
		index: null,
		which: null,
		type: null
	}

	$scope.CORRECT = 0
	$scope.INCORRECT = 1

	const materiaCallbacks = {}

	materiaCallbacks.initNewWidget = (widget, baseUrl) =>
		$scope.$apply(function() {
			$scope.dialog.intro = true
			$scope.addQuestion()
		})

	materiaCallbacks.initExistingWidget = function(title, widget, qset, version, baseUrl) {
		$scope.title = title
		$scope.tutorial.step = null

		if(qset.options) {
			$scope.enableQuestionBank = qset.options.enableQuestionBank ? qset.options.enableQuestionBank : false;
			$scope.questionBankVal = qset.options.questionBankVal ? qset.options.questionBankVal : 1;
			$scope.questionBankValTemp = qset.options.questionBankVal ? qset.options.questionBankVal : 1;
		}
		materiaCallbacks.onQuestionImportComplete(qset.items)
	}

	materiaCallbacks.onSaveClicked = function(mode) {
		if (mode == null) {
			mode = 'save'
		}
		const _isValid = $scope.validation('save')

		if (_isValid) {
			// Create a qset to save
			const qset = CreatorService.buildQset(
				$sanitize($scope.title),
				$scope.questions,
				$scope.randomizeOrder,
				$scope.enableQuestionBank,
				$scope.questionBankVal
			)
			if (qset) {
				return Materia.CreatorCore.save($sanitize($scope.title), qset, 2)
			}
		} else {
			Materia.CreatorCore.cancelSave('Please make sure every question is complete')

			return false
		}
	}

	materiaCallbacks.onSaveComplete = () => true

	materiaCallbacks.onQuestionImportComplete = function(items) {
		for (let item of items) {
			const _ids = []
			const _urls = []

			if (!item.questions || !item.answers) {
				return
			}

			try {
				if ( !item.answers[0]?.options.asset.type || item.answers[0].options.asset.type == 'image' || item.answers[0]?.options.asset && item.answers[0].options.asset.type == 'audio') {
					_ids[0] = item.answers[0].options.asset.id
					_urls[0] = Materia.CreatorCore.getMediaUrl(item.answers[0].options.asset.id)

					if ( !item.answers[0].options.asset.type) item.answers[0].options.asset.type = 'image'
				}
				else
				{
					_ids[0] = null
					_urls[0] = item.answers[0]?.options.asset?.value
				}

				if ( !item.answers[1]?.options.asset.type || item.answers[1].options.asset.type == 'image' || item.answers[1]?.options.asset && item.answers[1].options.asset.type == 'audio' ) {
					_ids[1] = item.answers[1].options.asset.id
					_urls[1] = Materia.CreatorCore.getMediaUrl(item.answers[1].options.asset.id)

					if ( !item.answers[1].options.asset.type) item.answers[1].options.asset.type = 'image'
				}
				else
				{
					_ids[1] = null
					_urls[1] = item.answers[1]?.options.asset?.value
				}

			} catch (error) {
				alert('Uh oh. Something went wrong with uploading your questions.')
			}

			$scope.questions.push({
				title: item.questions[0].text.replace(/\&\#10\;/g, '\n'),
				correct: {
					type: item.answers[0]?.options.asset?.type,
					id: _ids[0],
					alt: item.answers[0]?.text,
					value: _urls[0],
					answerId: item.answers[0].id,
					options: {
						feedback: item.answers[0].options.feedback ? item.answers[0].options.feedback : '',
					}
				},
				incorrect: {
					type: item.answers[1]?.options.asset?.type,
					id: _ids[1],
					alt: item.answers[1]?.text,
					value: _urls[1],
					answerId: item.answers[1].id,
					options: {
						feedback: item.answers[1].options.feedback ? item.answers[1].options.feedback : (item.options && item.options.feedback ? item.options.feedback : ''),
					}
				},
				isValid: true,
				id: item.id
			})

			if ($scope.questions[$scope.questions.length-1].correct.type == 'video') {
				if ($scope.questions[$scope.questions.length-1].correct.value.length > 0) $scope.questions[$scope.questions.length-1].correct.videoValid = true
				else $scope.questions[$scope.questions.length-1].correct.videoValid = false
			}

			if ($scope.questions[$scope.questions.length-1].incorrect.type == 'video') {
				if ($scope.questions[$scope.questions.length-1].incorrect.value.length > 0) $scope.questions[$scope.questions.length-1].incorrect.videoValid = true
				else $scope.questions[$scope.questions.length-1].incorrect.videoValid = false
			}
		}

		$scope.currIndex = 0
		$scope.$apply()
	}

	materiaCallbacks.onMediaImportComplete = function(media) {
		$scope.setURL(Materia.CreatorCore.getMediaUrl(media[0].id), media[0].id)
		$scope.$apply()
	}

	const _noTransition = () =>
		(() => {
			const result = []
			for (let action in $scope.actions) {
				if (action !== 'activate') {
					result.push(($scope.actions[action] = false))
				} else {
					result.push(undefined)
				}
			}
			return result
		})()

	const _updateIndex = function(action, data) {
		switch (action) {
			case 'prev':
				if ($scope.currIndex > 0) {
					return $scope.currIndex--
				} else {
					return ($scope.currIndex = $scope.questions.length - 1)
				}
			case 'next':
				if ($scope.currIndex < $scope.questions.length - 1) {
					return $scope.currIndex++
				} else {
					return ($scope.currIndex = 0)
				}
			case 'select':
				return ($scope.currIndex = data)
			case 'add':
				$scope.questions.push(data)
				return ($scope.currIndex = $scope.questions.length - 1)
			case 'remove':
				return $scope.currIndex--
		}
	}

	const _copyQuestion = function(original) {
		let newQuestion = angular.copy(original)
		newQuestion.id = null // force the question ID to be null in case an ID has already been provisioned
		return newQuestion
	}

	// View actions
	$scope.duplicate = function(index) {
		if ($scope.questions.length < 50) {
			$scope.actions.add = true
			$timeout(_noTransition, 660, true)

			$timeout(() => _updateIndex('add', _copyQuestion($scope.questions[index])), 200, true)
		}
	}

	$scope.setTitle = function() {
		if ($scope.title) {
			$scope.dialog.intro = $scope.dialog.edit = false
			$scope.step = 1
		}
	}

	$scope.addQuestion = (premade = null) => {

		// premade is only used for tests; normal creator use will always default to premade = null
		if (premade) {
			if ( premade.title && (typeof premade.correct == 'object') && (typeof premade.incorrect == 'object') ) {
				var question = premade
			}
			else return false
		} else {
			var question = {
				title: '',
				correct: {
					type: null,
					value: null,
					alt: '',
					id: null,
					answerId: null,
					options:
					{
						feedback:''
					}
				},
				incorrect: {
					type: null,
					value: null,
					alt: '',
					id: null,
					answerId: null,
					options:
					{
						feedback:''
					}
				},
				isValid: true,
				id: null
			}
		}

		if ($scope.questions.length > 0) {
			if ($scope.questions.length < 50) {
				$scope.actions.add = true
				$timeout(_noTransition, 660, true)

				$timeout(
					() => _updateIndex('add', question),
					200,
					true
				)
			}
		} else {
			$scope.questions.push(question)

			$scope.currIndex = $scope.questions.length - 1
		}
	}

	$scope.removeQuestion = function(index) {
		if ($scope.currIndex + 1 === $scope.questions.length) {
			$scope.actions.removelast = true
		} else {
			$scope.actions.remove = true
		}

		$timeout(_noTransition, 660, true)
		$scope.questions.splice(index, 1)

		if ($scope.currIndex === $scope.questions.length) {
			$timeout(() => _updateIndex('remove'), 200, true)
		}
	}

	$scope.validateQuestionBankVal = function() {
		if ($scope.questionBankValTemp >= 1 && $scope.questionBankValTemp <= $scope.questions.length) {
			$scope.questionBankVal = $scope.questionBankValTemp
		}
	}

	$scope.updateAnswerType = function(type, currIndex, side) {
		let sideIndex = 0
		if (side == $scope.CORRECT) {
			$scope.questions[currIndex].correct.type = type

			if (type == 'video') {
				$scope.questions[currIndex].correct.videoValid = null
			}
		}
		else
		{
			$scope.questions[currIndex].incorrect.type = type
			sideIndex = 1

			if (type == 'video') {
				$scope.questions[currIndex].incorrect.videoValid = null
			}
		}

		$scope.tutorialIncrement(sideIndex ? 5 : 2)
		switch (type) {
			case 'image':
				$scope.tutorial.text[sideIndex ? 5 : 2] = `Upload the ${sideIndex ? 'in' : ''}correct image`
				$scope.tutorial.text[sideIndex ? 6 : 3] = `Describe the ${sideIndex ? 'in' : ''}correct image`
				break
			case 'text':
				if (side == $scope.CORRECT) {
					$scope.questions[currIndex].correct.alt = '-'
				}
				else
				{
					$scope.questions[currIndex].incorrect.alt = '-'
				}
				$scope.tutorial.text[sideIndex ? 5 : 2] = `Enter the ${sideIndex ? 'in' : ''}correct answer`
				$scope.tutorial.text[sideIndex ? 6 : 3] = ``
				break
			case 'audio':
				$scope.tutorial.text[sideIndex ? 5 : 2] = `Upload the ${sideIndex ? 'in' : ''}correct audio`
				$scope.tutorial.text[sideIndex ? 6 : 3] = `Describe the ${sideIndex ? 'in' : ''}correct audio`
				break
			case 'video':
				$scope.tutorial.text[sideIndex ? 5 : 2] = `Link the ${sideIndex ? 'in' : ''}correct video`
				$scope.tutorial.text[sideIndex ? 6 : 3] = `Describe the ${sideIndex ? 'in' : ''}correct video`
				break
		}
	}

	// index: index of question
	// which: correct || incorrect
	$scope.requestImage = function(index, which) {
		Materia.CreatorCore.showMediaImporter(['image'])

		_assetRef.index = index
		_assetRef.which = which
		_assetRef.type = 'image'

		$scope.validation('change', index)
	}

	$scope.requestAudio = function(index, which) {
		Materia.CreatorCore.showMediaImporter(['audio'])
		// Save the image and which choice it's for

		_assetRef.index = index
		_assetRef.which = which
		_assetRef.type = 'audio'

		$scope.validation('change', index)
	}

	$scope.embedVideo = function(index, which) {
		try {
			let embedUrl = which == $scope.CORRECT ? $scope.questions[$scope.currIndex].correct.value : $scope.questions[$scope.currIndex].incorrect.value

			if (which == $scope.CORRECT) {
				if ( $scope.questions[$scope.currIndex].correct.videoValid != true) return $sce.trustAsResourceUrl('')
			}
			else
			{
				if ( $scope.questions[$scope.currIndex].incorrect.videoValid != true) return $sce.trustAsResourceUrl('')
			}

			if (embedUrl) {
				if (embedUrl.includes('youtu')) {
					const stringMatch = embedUrl.match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/)
					if (stringMatch != null && stringMatch.length > 1) {
						embedUrl = embedUrl.includes('/embed/') ? embedUrl : ('https://www.youtube.com/embed/' + (stringMatch && stringMatch[1]));
					} else {
						if (which == $scope.CORRECT) {
							$scope.questions[$scope.currIndex].correct.videoValid = false
						}
						else
						{
							$scope.questions[$scope.currIndex].incorrect.videoValid = false
						}
						embedUrl = ''
					}
				} else if (embedUrl.includes('vimeo')) {
					const stringMatch = embedUrl.match(/(?:vimeo)\.com.*(?:videos|video|channels|)\/([\d]+)/i)
					if (stringMatch != null && stringMatch.length > 1) {
						embedUrl = embedUrl.includes('player.vimeo.com') ? embedUrl : 'https://player.vimeo.com/video/' + (stringMatch && stringMatch[1]);
					}
					else {
						if (which == $scope.CORRECT) {
							$scope.questions[$scope.currIndex].correct.videoValid = false
						}
						else
						{
							$scope.questions[$scope.currIndex].incorrect.videoValid = false
						}
						embedUrl = ''
					}
				} else if (['mp4', 'flv', 'm4a', '3gp', 'mkv'].includes(embedUrl.split('.').pop())){
					embedUrl = embedUrl
				} else {
					if (which == $scope.CORRECT) {
						$scope.questions[$scope.currIndex].correct.videoValid = false
					}
					else
					{
						$scope.questions[$scope.currIndex].incorrect.videoValid = false
					}

					embedUrl = ''
				}
			}

			if (which == $scope.CORRECT) {
				$scope.questions[$scope.currIndex].correct.value = embedUrl
			}
			else
			{
				$scope.questions[$scope.currIndex].incorrect.value = embedUrl
			}

			return $sce.trustAsResourceUrl(embedUrl)
		} catch (e) {
			console.warn(e)
		}
	}

	$scope.setURL = function(URL, id) {
		// Bind the image URL to the DOM
		if (_assetRef.which == $scope.CORRECT) {
			$scope.questions[_assetRef.index].correct.value = URL
			$scope.questions[_assetRef.index].correct.type = _assetRef.type
			$scope.questions[_assetRef.index].correct.id = id
		}
		else
		{
			$scope.questions[_assetRef.index].incorrect.value = URL
			$scope.questions[_assetRef.index].incorrect.type = _assetRef.type
			$scope.questions[_assetRef.index].incorrect.id = id
		}
	}

	$scope.clearMedia = function(index, which) {
		if (which == $scope.CORRECT) {
			$scope.questions[index].correct.value = null
			$scope.questions[index].correct.id = null
		}
		else
		{
			$scope.questions[index].incorrect.value = null
			$scope.questions[index].incorrect.id = null
		}
	}

	$scope.clearType = function(index, which) {
		if (which == $scope.CORRECT) {
			$scope.questions[index].correct.value = null
			$scope.questions[index].correct.id = null
			$scope.questions[index].correct.alt = ''
			$scope.questions[index].correct.type = null
		}
		else
		{
			$scope.questions[index].incorrect.value = null
			$scope.questions[index].incorrect.id = null
			$scope.questions[index].incorrect.alt = ''
			$scope.questions[index].incorrect.type = null
		}
	}

	$scope.next = function() {
		$scope.actions.slideright = true

		$timeout(() => _updateIndex('next'), 200, true)

		$timeout(_noTransition, 660, true)
	}

	$scope.prev = function() {
		$scope.actions.slideleft = true

		$timeout(() => _updateIndex('prev'), 200, true)

		$timeout(_noTransition, 660, true)
	}

	$scope.selectCurrent = function(index) {
		if (index > $scope.currIndex) {
			$scope.actions.slideright = true
		}
		if (index < $scope.currIndex) {
			$scope.actions.slideleft = true
		}

		$timeout(() => _updateIndex('select', index), 200, true)

		$timeout(_noTransition, 660, true)
	}

	$scope.moveUp = function(index) {
		if (index > 0) {
			[$scope.questions[index-1], $scope.questions[index]] = [$scope.questions[index], $scope.questions[index-1]];
		}
	}

	$scope.moveDown = function(index) {
		if (index < $scope.questions.length - 1) {
			[$scope.questions[index+1], $scope.questions[index]] = [$scope.questions[index], $scope.questions[index+1]];
		}
	}

	$scope.tutorialIncrement = function(step) {
		if ($scope.tutorial.step > 0) {
			if (step >= $scope.tutorial.step)
			{
				if (step == 9) {
					return $scope.tutorial.step = null
				}
				else {
					return $scope.tutorial.step = step + 1
				}
			}
		} else {
			return false
		}
	}

	$scope.limitLength = () =>
		($scope.questions[$scope.currIndex].title = $scope.questions[$scope.currIndex].title &&
			$scope.questions[$scope.currIndex].title.substring(0, 500)
		)

	$scope.validation = function(action, which) {
		switch (action) {
			case 'save':
				for (let q of $scope.questions) {
					if (!q.title || !q.correct.alt || !q.incorrect.alt || !q.correct.value || !q.incorrect.value) {
						q.invalid = true
						$scope.dialog.invalid = true
						$scope.$apply()
					}
				}
				if ($scope.dialog.invalid) {
					return false
				} else {
					return true
				}
			case 'change':
				if (
					$scope.questions[which].title &&
					$scope.questions[which].correct.alt &&
					$scope.questions[which].incorrect.alt &&
					$scope.questions[which].correct.value &&
					$scope.questions[which].incorrect.value
				) {
					return ($scope.questions[which].invalid = false)
				}
				break
		}
	}

	$scope.hideModal = () => {
		$scope.dialog.invalid = $scope.dialog.edit = $scope.dialog.intro = $scope.dialog.rearrange = $scope.questionBankModal = false
		$scope.questionBankValTemp = $scope.questionBankVal
	}

	return Materia.CreatorCore.start(materiaCallbacks)
}
