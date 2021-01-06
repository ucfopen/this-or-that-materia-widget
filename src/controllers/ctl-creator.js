export const ControllerThisOrThatCreator = ($scope, $timeout, $sanitize, CreatorService) => {
	$scope.title = 'My This or That widget'
	$scope.randomizeOrder = false
	$scope.questions = []
	$scope.currIndex = -1
	$scope.dialog = {}
	$scope.tutorial = {
		checked: false,
		step: 1,
		text: [
			'Enter a question',
			'Upload the correct image',
			'Describe the correct image',
			'Upload the incorrect image',
			'Describe the incorrect image',
			'Add more questions!'
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
	const _imgRef = []

	const materiaCallbacks = {}

	materiaCallbacks.initNewWidget = (widget, baseUrl) =>
		$scope.$apply(function() {
			$scope.dialog.intro = true
			$scope.addQuestion()
		})

	materiaCallbacks.initExistingWidget = function(title, widget, qset, version, baseUrl) {
		$scope.title = title
		$scope.tutorial.step = null
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
				$scope.randomizeOrder
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

			// gets the image URLs
			try {
				if (
					item.answers &&
					item.answers[0] &&
					item.answers[0].options &&
					item.answers[0].options.asset
				) {
					_ids[0] = item.answers[0].options.asset.id
					_urls[0] = Materia.CreatorCore.getMediaUrl(item.answers[0].options.asset.id)
				}
				if (
					item.answers &&
					item.answers[1] &&
					item.answers[1].options &&
					item.answers[1].options.asset
				) {
					_ids[1] = item.answers[1].options.asset.id
					_urls[1] = Materia.CreatorCore.getMediaUrl(item.answers[1].options.asset.id)
				}
			} catch (error) {
				alert('Uh oh. Something went wrong with uploading your questions.')
				return
			}

			// Add each imported question to the DOM
			$scope.questions.push({
				title: item.questions[0].text.replace(/\&\#10\;/g, '\n'),
				images: _ids,
				isValid: true,
				alt: [
					item.answers[0].text,
					item.answers[1].text,
					(item.options != null ? item.options.feedback : undefined) || ''
				],
				URLs: _urls,
				id: item.id,
				qid: item.questions[0].id,
				ansid: item.answers[0].id
			})
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

	// View actions
	$scope.duplicate = function(index) {
		if ($scope.questions.length < 50) {
			$scope.actions.add = true
			$timeout(_noTransition, 660, true)

			$timeout(() => _updateIndex('add', angular.copy($scope.questions[index])), 200, true)
		}
	}

	$scope.setTitle = function() {
		if ($scope.title) {
			$scope.dialog.intro = $scope.dialog.edit = false
			$scope.step = 1
		}
	}

	$scope.addQuestion = function(title, images, imgsFilled, isValid, alt, URLs, id, qid, ansid) {
		if (title == null) {
			title = ''
		}
		if (images == null) {
			images = ['', '']
		}
		if (imgsFilled == null) {
			imgsFilled = [false, false]
		}
		if (isValid == null) {
			isValid = true
		}
		if (alt == null) {
			alt = ['', '']
		}
		if (URLs == null) {
			URLs = ['assets/img/placeholder.png', 'assets/img/placeholder.png']
		}
		if (id == null) {
			id = ''
		}
		if (qid == null) {
			qid = ''
		}
		if (ansid == null) {
			ansid = ''
		}
		if ($scope.questions.length > 0) {
			if ($scope.questions.length < 50) {
				$scope.actions.add = true
				$timeout(_noTransition, 660, true)

				$timeout(
					() => _updateIndex('add', { title, images, isValid, alt, URLs, id, qid, ansid }),
					200,
					true
				)
			}
		} else {
			$scope.questions.push({
				title,
				images,
				isValid,
				alt,
				URLs,
				id,
				qid,
				ansid
			})

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

	$scope.requestImage = function(index, which) {
		Materia.CreatorCore.showMediaImporter()
		// Save the image and which choice it's for
		_imgRef[0] = index
		_imgRef[1] = which

		$scope.validation('change', index)
	}

	$scope.setURL = function(URL, id) {
		// Bind the image URL to the DOM
		$scope.questions[_imgRef[0]].URLs[_imgRef[1]] = URL
		$scope.questions[_imgRef[0]].images[_imgRef[1]] = id
	}

	$scope.clearImage = function(index, which) {
		$scope.questions[index].URLs[which] = 'http://placehold.it/300x250'
		$scope.questions[index].images[which] = null
		$scope.$apply()
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

	$scope.tutorialIncrement = function(step) {
		if ($scope.tutorial.step > 0) {
			switch (step) {
				case 1:
					if ($scope.tutorial.step === 1) {
						return $scope.tutorial.step++
					}
					break
				case 2:
					if ($scope.tutorial.step === 2) {
						return $scope.tutorial.step++
					}
					break
				case 3:
					if ($scope.tutorial.step === 3) {
						return $scope.tutorial.step++
					}
					break
				case 4:
					if ($scope.tutorial.step === 4) {
						return $scope.tutorial.step++
					}
					break
				case 5:
					if ($scope.tutorial.step === 5) {
						return $scope.tutorial.step++
					}
					break
				case 6:
					if ($scope.tutorial.step === 6) {
						return ($scope.tutorial.step = null)
					}
					break
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
					if (!q.title || !q.alt[0] || !q.alt[1] || !q.images[0] || !q.images[1]) {
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
					$scope.questions[which].alt[0] &&
					$scope.questions[which].alt[1] &&
					$scope.questions[which].images[0] &&
					$scope.questions[which].images[1]
				) {
					return ($scope.questions[which].invalid = false)
				}
				break
		}
	}

	$scope.hideModal = () =>
		($scope.dialog.invalid = $scope.dialog.edit = $scope.dialog.intro = false)

	return Materia.CreatorCore.start(materiaCallbacks)
}
