import './score-screen-globals.css'
import { useEffect } from 'react'
import { getEmbeddedVideoUrl } from '../../utils'
interface ScoreScreenProps {
	qset: ThisOrThatQset,
	rawScoreTable: any, // TODO
	reportHeight: (newHeight: number) => void,
}

export default function ScoreScreen({ qset, rawScoreTable, reportHeight }: ScoreScreenProps) {

	const calculateAndReportHeight = () => {
		const html = document.querySelector('html')
		if (html) {
			const htmlCompStyle = window.getComputedStyle(html)
			reportHeight(Math.ceil(parseFloat(htmlCompStyle.height)))
		}
	}

	useEffect(() => {
		const images = Array.from(document.querySelectorAll('img'))
		
		let loadedCount = 0
		const totalImages = images.length

		if (totalImages === 0) {
			calculateAndReportHeight()
			return
		}

		const handleImageLoad = () => {
			loadedCount++
			if (loadedCount === totalImages) {
				requestAnimationFrame(() => {
					calculateAndReportHeight()
				})
			}
		}

		images.forEach(img => {
			if (img.complete) {
				handleImageLoad()
			} else {
				img.addEventListener('load', handleImageLoad)
				img.addEventListener('error', handleImageLoad) // Count errors too to avoid hanging
			}
		})

		return () => {
			images.forEach(img => {
				img.removeEventListener('load', handleImageLoad)
				img.removeEventListener('error', handleImageLoad)
			})
		}
	}, [reportHeight])

	useEffect(() => {
		let resizeTimeout: number | undefined

		const handleResize = () => {
			if (resizeTimeout) {
				clearTimeout(resizeTimeout)
			}
			resizeTimeout = window.setTimeout(() => {
				requestAnimationFrame(() => {
					calculateAndReportHeight()
				})
			}, 150)
		}

		window.addEventListener('resize', handleResize)

		return () => {
			window.removeEventListener('resize', handleResize)
			if (resizeTimeout) {
				clearTimeout(resizeTimeout)
			}
		}
	}, [reportHeight])

	const getQuestionIndex = (qset, id) => {
		for (let i = 0; i < qset.items.length; i++) {
			if (qset.items[i].id == id) return i
		}
		return -1
	}

	// Calculate dynamic font size based on text length
	const getTextFontSize = (text: string): string => {
		const length = text.length
		if (length < 100) return '1.2em'
		if (length < 200) return '1.1em'
		if (length < 300) return '1em'
		if (length < 500) return '0.95em'
		return '0.85em'
	}

	// left and right side rendered elements will be handled basically identically
	// render differently based on the given question's type - text, image, audio or video
	const getQuestionRenderElement = itemSide => {
		switch(itemSide.asset.type) {
			case 'image':
				return <div className='item-image'>
					<img src={itemSide.asset.value} alt={itemSide.text} />
				</div>
			case 'text':
				return <div className='item-text' style={{ fontSize: getTextFontSize(itemSide.asset.value) }}>
					{ itemSide.asset.value }
				</div>
			case 'audio':
				return <div className='item-audio'>
					<span>{itemSide.text}</span>
					<audio
						controls
						src={itemSide.asset.value}>
						Your browser does not support the
						<code>audio</code> element.
					</audio>
				</div>
			case 'video':
				return <div className='item-video'>
					<iframe
						width="100%"
						height="100%"
						src={ getEmbeddedVideoUrl(itemSide.asset.value) }
						frameBorder="0"
						allowFullScreen></iframe>
				</div>
			//shouldn't be possible, but just in case
			default:
				return <div></div>
		}
	}

	let numIncorrect = 0
	rawScoreTable.forEach(item => {
		if (item.score < 100) numIncorrect++
	})

	let overallDeduction = numIncorrect / rawScoreTable.length
	const incorrectQuestionDeduction = Math.round((overallDeduction / numIncorrect) * 100)

	const items = rawScoreTable.map(question => {
		let questionIndex = getQuestionIndex(qset, question.data[1])

		const item = {
			correct: question.score === 100,
			// deduction: question.score === 100 ? 0 : incorrectQuestionDeduction,
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

		// left side
		// old qsets don't have an asset type and value property
		if ( !item.left.asset.value && !item.left.asset.type) {
			item.left.asset.type = 'image'
			item.left.asset.value = Materia.ScoreCore.getMediaUrl(item.left.asset.id)
		}
		else if (item.left.asset.type == 'audio') item.left.asset.value =  Materia.ScoreCore.getMediaUrl(item.left.asset.id)
		else if (item.left.asset.type == 'video') item.left.asset.value = item.left.asset.value

		// right side
		if ( !item.right.asset.value && !item.right.asset.type) {
			item.right.asset.type = 'image'
			item.right.asset.value = Materia.ScoreCore.getMediaUrl(item.right.asset.id)
		}
		else if (item.right.asset.type == 'audio') item.right.asset.value = Materia.ScoreCore.getMediaUrl(item.right.asset.id)
		else if (item.right.asset.type == 'video') item.right.asset.value = item.right.asset.value

		const leftSide = getQuestionRenderElement(item.left)
		const rightSide = getQuestionRenderElement(item.right)

		// can probably do variable classnames more elegantly, this is easy and quick
		const headingClasses = ['item-score']
		headingClasses.push( item.correct ? 'correct' : 'incorrect')

		const leftClasses = ['item-correct']
		const rightClasses = ['item-incorrect']
		if (item.correct) leftClasses.push('selected')
		else rightClasses.push('selected')

		// this should probably be a separate component but why bother, it's simple enough
		return <section key={'question-' + questionIndex} className='question-item'>
			<h3 data-question-count={ 'Question ' + (questionIndex + 1) } data-index={questionIndex + 1}>
				{item.question}
			</h3>
			<span className={headingClasses.join(' ')}>
				{ item.correct ? 'Correct' : 'Incorrect' }
			</span>
			<section className='cards'>
				<div className={leftClasses.join(' ')}>
					{leftSide}
				</div>
				<div className={rightClasses.join(' ')}>
					{rightSide}
				</div>
			</section>
		</section>
	})

	return (
		<div className={`content-frame ${qset.options?.theme ?? 'whimsical'}`}>
			<h2>Assessment Complete</h2>
			<h5>Review your answers below</h5>
			{items}
		</div>
	)
}
