client = {}

describe 'Testing framework', ->
	it 'should load widget', (done) ->
		require('./widgets.coffee') 'this-or-that', ->
			client = this
			done()
	, 25000

describe 'Main page', ->
	it 'should let me press start', (done) ->
		client.waitFor '.start', 500
		client.click '.start'
		client.pause 500
		done()

	it 'should have a question title', (done) ->
		client.getText '#question', (err, text) ->
			expect(err).toBeNull()
			expect(text).toContain("Which of these paintings is from the Baroque period?")
			client.pause 500
			done()

	it 'should load the image', (done) ->
		client.pause 500
		client.waitFor 'img[alt="The Fall of Phaeton by Peter Paul Rubens"]'
		client.pause 500
		done()

	it 'should choose the baroque painting', (done) ->
		client.pause 500
		client.click 'img[alt="The Fall of Phaeton by Peter Paul Rubens"]'
		client.pause 500
		done()

	it 'should say correct', (done) ->
		client.getText '.correct .overlay', (err, text) ->
			expect(err).toBeNull()
			expect(text).toContain("Correct!")
			client.pause 500
			done()

	it 'should click the next button', (done) ->
		client.waitFor '#next'
		client.click '#next'
		client.pause 500
		done()

	it 'should choose the five nights at freddys screenshot', (done) ->
		client.pause 500
		client.click 'img[alt="Five Nights at Freddy\'s 2"]'
		client.pause 500
		done()

	it 'should say incorrect', (done) ->
		client.getText '.incorrect .overlay', (err, text) ->
			expect(err).toBeNull()
			expect(text).toContain("Incorrect")
			client.pause 500
			done()

	it 'should click the next button again', (done) ->
		client.waitFor '#next'
		client.click '#next'
		client.pause 500
		done()

	it 'should choose the photo of the labrador', (done) ->
		client.pause 500
		client.click 'img[alt="A large yellow dog named Chance"]'
		client.pause 500
		done()

	it 'should click the next button for the last time', (done) ->
		client.waitFor '#next'
		client.click '#next'
		client.pause 500
		done()

	it 'should let me press view scores', (done) ->
		client.pause 1000
		client.waitFor '.reset'
		client.click '.reset'
		client.pause 1000
		done()

describe 'Score page', ->
	it 'should get a 67', (done) ->
		client.pause 10000
		client.getTitle (err, title) ->
			expect(err).toBeNull()
			expect(title).toBe('Score Results | Materia')
			client
				.waitFor('.overall_score')
				.getText '.overall_score', (err, text) ->
					expect(err).toBeNull()
					expect(text).toBe('67%')
					client.call(done)
					client.end()
	, 25000