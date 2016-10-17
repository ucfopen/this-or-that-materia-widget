describe 'ThisOrThatEngine module', ->

  # grab the demo widget for easy reference
  widgetInfo = window.__demo__['src/demo']
  qset = widgetInfo.qset

  $scope = {}
  ctrl = {}

  describe 'ThisOrThatEngineCtrl', ->
    # Grab the 'ThisOrThatEngine' module for use in upcoming tests
    module.sharedInjector()
    beforeAll(module('ThisOrThatEngine'))

    # Set up the controller/scope prior to these tests
    beforeAll inject ($rootScope, $controller) ->
      # Instantiate $scope with all of the generic $scope methods/properties
      $scope = $rootScope.$new()

      # Pass $scope through the 'ThisOrThatEngineCtrl' controller
      ctrl = $controller('ThisOrThatEngineCtrl', { $scope: $scope })

    beforeEach ->
      # Spy on Materia.Engine.end()
      spyOn(Materia.Engine, 'end')
      # Spy on Materia.Engine.getImageAssetUrl()
      spyOn(Materia.Engine, 'getImageAssetUrl')
      # Spy on Materia.Engine.setHeight()
      spyOn(Materia.Engine, 'setHeight')

    it 'should start the game correctly', ->
      $scope.start(widgetInfo, qset.data)
      expect(Materia.Engine.getImageAssetUrl).toHaveBeenCalled()

    it 'should start the game with the first question', ->
      expect($scope.questions.current).toEqual(0)
      expect($scope.title)
        .toEqual('Which of these paintings is from the Baroque period?')
      expect($scope.answers.length).toEqual(2)
      expect($scope.answers).toContain(jasmine.objectContaining(
        { text: 'The Mona Lisa by Leonardo DaVinci' }
      ))
      expect($scope.answers).toContain(jasmine.objectContaining(
        { text: 'The Fall of Phaeton by Peter Paul Rubens' }
      ))
      expect($scope.questions.selected).toEqual(false)
      expect($scope.questions.transition).toEqual(false)

    it 'should check the answer choice', ->
      # The answer choices are randomized, so to ensure we test this properly
      # I just set the first answer to correct
      $scope.answers[0].value = 100
      $scope.checkChoice(0)

      expect($scope.questions.correct[0]).toEqual('Correct!')

      $scope.answers[1].value = 0
      $scope.checkChoice(1)

      expect($scope.questions.correct[1]).toEqual('Incorrect')
      expect($scope.questions.selected).toEqual(true)
      expect($scope.gameState.showNext).toEqual(true)

    it 'should update when next is clicked', ->
      $scope.nextClicked()
      expect($scope.gameState.showNext).toEqual(false)
      expect($scope.questions.correct).toEqual(['', ''])
      expect($scope.questions.choice).toEqual(-1)
      expect($scope.questions.transition).toEqual(true)
      expect($scope.hands.thisRaised).toEqual(false)
      expect($scope.hands.thatRaised).toEqual(false)

    it 'should be in game after the intro closes', ->
      $scope.closeIntro()
      expect($scope.gameState.ingame).toEqual(true)

    it 'should end the game when all questions are done', inject(($timeout) ->
      $scope.questions.current = 100
      $scope.nextClicked()

      # There are two $timeouts that are called, so $timeout must be flushed
      # twice
      $timeout.flush()
      $timeout.flush()
      $timeout.verifyNoPendingTasks()

      expect(Materia.Engine.end).toHaveBeenCalled()
      expect($scope.title).toBeFalsy()
    )

    it 'should update the height after closing the intro', inject(($timeout) ->
      $scope.closeIntro()

      $timeout.flush()
      $timeout.verifyNoPendingTasks()

      expect(Materia.Engine.setHeight).toHaveBeenCalled()
    )

    it 'should return from randomizing when there are no answers', ->
      _qset =
        data:
          items: [
            {
              questions: [
                {
                  text: 'test'
                }
              ]
              answers: []
            }
          ]

      $scope.questions.current = -1
      $scope.start(widgetInfo, _qset.data)

    it 'should end the game when viewing scores', ->
      $scope.viewScores()
      expect(Materia.Engine.end).toHaveBeenCalled()


describe 'ThisOrThatCreator module', ->
  beforeEach module('ThisOrThatCreator')

  $scope = {}
  ctrl = undefined

  beforeEach inject(($rootScope) ->
    $scope = $rootScope.$new()
  )

  describe 'ThisOrThatCreatorCtrl', ->

    beforeEach inject(($controller) ->
      ctrl = $controller('ThisOrThatCreatorCtrl', $scope: $scope)
    )

    # override the method that runs if the widget is saved properly
    Materia.CreatorCore.save = (title, qset, version) ->
      true

    # override the method that runs if the widget is saved without a title
    Materia.CreatorCore.cancelSave = (msg) ->
      msg

    it 'should make a new widget', ->
      $scope.initNewWidget()
      expect($scope.title).toBe 'My This or That widget'