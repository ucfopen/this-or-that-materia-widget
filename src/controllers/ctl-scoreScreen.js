export const ControllerThisOrThatScorescreen = function($scope, $sce) {

	$scope.items = []
	
	const materiaCallbacks = {}

	const getHeight = () => Math.ceil(parseFloat(window.getComputedStyle(document.querySelector('html')).height))

	const getQuestionIndex = (qset, id) => {
		for (let i = 0; i < qset.items.length; i++) {
			if (qset.items[i].id == id) return i
		}
		return -1
	}

	const getIndividualScoreDeduction = (table) => {
		let numIncorrect = 0
		table.forEach(item => {
			if (item.score < 100) numIncorrect++
		})
		
		let overallDeduction = numIncorrect / table.length
		return parseInt((overallDeduction / numIncorrect) * 100)
	}

	materiaCallbacks.update = (qset, scoreTable) => {
		$scope.$apply(() => {
			$scope.items = scoreTable.map((question, index) => {

				let questionIndex = getQuestionIndex(qset, question.data[1])
				// $sce.trustAsResourceUrl
				let item = {
					correct: (question.score == 100),
					deduction: question.score == 100 ? 0 : getIndividualScoreDeduction(scoreTable),
					left: {
						text: qset.items[questionIndex].answers[0].text,
						asset: qset.items[questionIndex].answers[0].options.asset
					},
					right: {
						text: qset.items[questionIndex].answers[1].text,
						asset: qset.items[questionIndex].answers[1].options.asset
					},
					question: qset.items[questionIndex].questions[0].text
				}

				// **** left side ****
				if ( !item.left.asset.value && !item.left.asset.type) { // old qsets don't have an asset type and value property
					item.left.asset.type = 'image'
					item.left.asset.value = Materia.ScoreCore.getMediaUrl(item.left.asset.id)
				}
				else if (item.left.asset.type == 'audio') item.left.asset.value =  Materia.ScoreCore.getMediaUrl(item.left.asset.id)
				else if (item.left.asset.type == 'video') item.left.asset.value = $sce.trustAsResourceUrl(item.left.asset.value)

				// **** right side ****
				if ( !item.right.asset.value && !item.right.asset.type) { // old qsets don't have an asset type and value property
					item.right.asset.type = 'image'
					item.right.asset.value = Materia.ScoreCore.getMediaUrl(item.right.asset.id)
				}
				else if (item.right.asset.type == 'audio') item.right.asset.value = Materia.ScoreCore.getMediaUrl(item.right.asset.id)
				else if (item.right.asset.type == 'video') item.right.asset.value = $sce.trustAsResourceUrl(item.right.asset.value)
				
				// get direction of which card user picked
				if (item.correct) {
					item.chosen = "left"
				}  else if (item.correct === false) {
					item.chosen = "right"
				}

				return item
			})
		})

		Materia.ScoreCore.setHeight(getHeight())
	}

	materiaCallbacks.start = (instance, qset, scoreTable, isPreview, qsetVersion) => {
		materiaCallbacks.update(qset, scoreTable)
	}

	Materia.ScoreCore.hideResultsTable()
	
	return Materia.ScoreCore.start(materiaCallbacks)
}