client = {}

describe 'Testing framework', ->
	it 'should load widget', (done) ->
		require('./widgets.coffee') 'this-or-that', ->
			client = this
			done()
	, 45000

describe 'Main page', ->
	it 'should let me press start', (done) ->
		client.click '.start'
		client.pause 1000
		done()

	it 'should have a question title', (done) ->
		client.getText '#question', (err, text) ->
			expect(text).toContain("Which of these paintings is from the Baroque period?")
			done()

	it 'should load the image', (done) ->
		client.pause 1000
		client.waitFor 'img[alt="The Fall of Phaeton by Peter Paul Rubens"]'
		done()

	it 'should choose the baroque painting', (done) ->
		client.pause 1000
		client.click 'button[data-title="The Fall of Phaeton by Peter Paul Rubens"]'
		done()

	it 'should say correct', (done) ->
		client.getText '.correct .overlay', (err, text) ->
			expect(text).toContain("Correct!")
			done()

	it 'should click the next button', (done) ->
		client.click '#next'
		client.pause 1000
		done()

	it 'should choose the five nights at freddys screenshot', (done) ->
		client.pause 1000
		client.click 'button[data-title="Five Nights at Freddy\'s 2"]'
		done()

	it 'should say incorrect', (done) ->
		client.getText '.incorrect .overlay', (err, text) ->
			expect(text).toContain("Incorrect")
			done()

	it 'should click the next button again', (done) ->
		client.click '#next'
		done()

	it 'should choose the photo of the labrador', (done) ->
		client.pause 1000
		client.click 'button[data-title="A large yellow dog named Chance"]'
		done()

	it 'should click the next button for the last time', (done) ->
		client.click '#next'
		client.pause 1000
		done()

	it 'should let me press view scores', (done) ->
		client.pause 1000
		client.click '.reset'
		done()

describe 'Score page', ->
	it 'should get a 67', (done) ->
		client.pause 10000
		client.getTitle (err, title) ->
			expect(title).toBe('Score Results | Materia')
			client
				.getText '.overall-score, .overall_score', (err, text) ->
					expect(text).toBe('67%')
					client.call(done)
					client.end()
	, 40000
