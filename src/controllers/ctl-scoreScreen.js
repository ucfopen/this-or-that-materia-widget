export const ControllerThisOrThatScorescreen = ($scope, $timeout, $sanitize, $sce) => {

	$scope.items = []
	
	const materiaCallbacks = {}

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

	materiaCallbacks.start = (instance, qset, scoreTable, isPreview, qsetVersion) => {
		console.log("instance:")
		console.log(instance)
		console.log("qset:")
		console.log(qset)
		console.log("scoreTable:")
		console.log(scoreTable)

		$scope.$apply(() => {
			$scope.items = scoreTable.map((question, index) => {

				let questionIndex = getQuestionIndex(qset, question.data[1])
				// $sce.trustAsResourceUrl
				let item = {
					correct: (question.score == 100),
					deduction: getIndividualScoreDeduction(scoreTable),
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

				// old qsets don't have an asset type and value property
				if ( !item.left.asset.value && !item.left.asset.type) {
					item.left.asset.type = 'image'
					item.left.asset.value = Materia.ScoreCore.getMediaUrl(item.left.asset.id)
				}

				if ( !item.right.asset.value && !item.right.asset.type) {
					item.right.asset.type = 'image'
					item.right.asset.value = Materia.ScoreCore.getMediaUrl(item.right.asset.id)
				}

				if (item.left.asset.type == 'video') item.left.asset.value = $sce.trustAsResourceUrl(item.left.asset.value)
				if (item.right.asset.type == 'video') item.right.asset.value = $sce.trustAsResourceUrl(item.right.asset.value)

				return item
			})
		})
	}

	Materia.ScoreCore.hideResultsTable()
	
	return Materia.ScoreCore.start(materiaCallbacks)
}