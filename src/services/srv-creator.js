export const buildQset = ($sanitize, title, items, isRandom) => {
	const qsetItems = []
	const qset = {}
	qset.options = {}

	// Decide if it is ok to save
	if (title === '') {
		Materia.CreatorCore.cancelSave('Please enter a title.')
		return false
	}

	for (let item of items) {
		const processedItem = processQsetItem($sanitize, item)
		if (processedItem) {
			qsetItems.push(processedItem)
		}
	}

	qset.items = qsetItems
	qset.options.randomizeOrder = isRandom
	return qset
}

export const processQsetItem = ($sanitize, item) => {
	// Remove any dangerous content
	item.ques = $sanitize(item.title)

	return {
		materiaType: 'question',
		id: item.id,
		type: 'MC',
		questions: [{ text: item.ques }],
		answers: [
			{
				text: item.correct.alt,
				value: 100,
				options: {
					asset: {
						materiaType: 'asset',
						id: item.correct.id,
						value: item.correct.value,
						type: item.correct.type
					}
				},
				feedback: item.correct.feedback,
				id: item.correct.answerId
			},
			{
				text: item.incorrect.alt,
				value: 0,
				options: {
					asset: {
						materiaType: 'asset',
						id: item.incorrect.id,
						value: item.incorrect.value,
						type: item.incorrect.type
					}
				},
				feedback: item.incorrect.feedback,
				id: item.incorrect.answerId
			},
		]
	}
}

// The 'Resource' service contains all app logic that does pertain to DOM manipulation
export const CreatorService = function($sanitize) {
	return {
		buildQset: buildQset.bind(null, $sanitize)
	}
}
