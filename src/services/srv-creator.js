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
				text: item.alt[0],
				value: 100,
				options: {
					asset: {
						materiaType: 'asset',
						id: item.images[0]
					}
				}
			},
			{
				text: item.alt[1],
				value: 0,
				options: {
					asset: {
						materiaType: 'asset',
						id: item.images[1]
					}
				}
			}
		],
		options: {
			feedback: item.alt[2]
		}
	}
}


// The 'Resource' service contains all app logic that does pertain to DOM manipulation
export const CreatorService = function($sanitize) {
	return {
		buildQset: buildQset.bind(null, $sanitize)
	}
}
