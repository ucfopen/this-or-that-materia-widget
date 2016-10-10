describe 'ThisOrThatEngine module', ->
  beforeEach module('ThisOrThatEngine')

  describe 'ThisOrThatEngineCtrl', ->
    $scope = {}
    ctrl = undefined

    beforeEach inject(($controller) ->
      ctrl = $controller('ThisOrThatEngineCtrl', $scope: $scope)
    )

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