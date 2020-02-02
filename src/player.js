let _qset

// fisher-yates shuffle algorithm
const shuffleArray = array => {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1))
		const x = array[i]
		array[i] = array[j]
		array[j] = x
	}

	return array
}

const getAllImageUrls = _qset => {
	const images = []
	_qset.items.forEach(item => {
		if(!item.answers) return
		item.answers.forEach(ans => {
			ans.options.asset.imageUrl = Materia.Engine.getImageAssetUrl(ans.options.asset.id)
			images.push(ans.options.asset.imageUrl);
		})
	})

	return images
}

const onMateriaStart = ($scope, instance, qset, version) => {
	_qset = qset;
	_qset.version = version;

	if (_qset.options && _qset.options.randomizeOrder === true) {
		shuffleArray(_qset.items);
	}

	$scope.images = getAllImageUrls(_qset)
	showNextQuestion($scope);
};

const showNextQuestion = $scope => {
	$scope.questions.current++;
	const curItem = _qset.items[$scope.questions.current]

	if (curItem) {
		$scope.title = curItem.questions[0].text;
		$scope.answers = shuffleArray(curItem.answers);

		$scope.questions.selected   = false;
		$scope.questions.transition = false;
	} else {
		endGame($scope);
	}
};

const endGame = ($scope) => {
	$scope.gameState.ingame  = false;
	$scope.gameState.endgame = true;
	Materia.Engine.end(false);
	$scope.title = '';
	$scope.$apply()
};

const viewScores = () => {
	Materia.Engine.end(true);
}

const checkChoice = ($scope, value) => {
	//get the id, value, and text of the chosen answer
	const curItem   = _qset.items[$scope.questions.current]
	const curAnswer = curItem.answers[value]
	const _feedback = curItem.options.feedback;
	//track which image the user selected in the game
	$scope.questions.choice = value;

	switch (curAnswer.value) {
		case 0:
			$scope.questions.correct[value] = 'Incorrect';
			$scope.questions.feedback[value] = curItem.options.feedback || ''
			break;

		case 100:
			$scope.questions.correct[value] = 'Correct!';
			break;
	}

	switch (parseInt(_qset.version, 10)) {
		case 0:
		case 1:
		case NaN:
			// version 1 used answer text for checking answers
			Materia.Score.submitQuestionForScoring(curItem.id, curAnswer.text);
			break;

		case 2:
		default:
			// version 2+ uses answer id for checking answers
			Materia.Score.submitQuestionForScoring(curItem.id, curAnswer.id, curAnswer.text);
	}

	$scope.questions.selected = true;
	$scope.gameState.showNext = true;
};

const nextClicked = ($scope, $timeout) => {
	$scope.gameState.showNext   = false;
	$scope.questions.correct    = ['',''];
	$scope.questions.feedback   = ['',''];
	$scope.questions.choice     = -1;
	$scope.questions.transition = true;
	$scope.hands.thisRaised     = false;
	$scope.hands.thatRaised     = false;

	$timeout(showNextQuestion.bind(null, $scope), 1000);
};

const closeIntro = ($scope) => {
	$scope.gameState.ingame = true;
}

const ControllerThisOrThatPlayer = function ($scope, $timeout) {
	$scope.gameState = {
		ingame: false,
		endgame: false,
		score: 0,
		showNext: false
	};

	$scope.questions = {
		choice: -1,
		current: -1,
		correct: ['',''],
		feedback: ['',''],
		selected: false,
		transition: false
	};

	// the stage hands
	$scope.hands = {
		thisRaised: false,
		thatRaised: false
	};

	//for preloading
	$scope.title = ''
	$scope.images = [];
	$scope.answers = []
	$scope.viewScores = viewScores
	$scope.checkChoice = checkChoice.bind(null, $scope)
	$scope.nextClicked = nextClicked.bind(null, $scope, $timeout)
	$scope.closeIntro = closeIntro.bind(null, $scope)

	Materia.Engine.start({start: onMateriaStart.bind(null, $scope)});
}


const ThisOrThatEngine = angular.module('ThisOrThatEngine', ['ngAnimate', 'hammer', 'ngSanitize']);
ThisOrThatEngine.controller('ThisOrThatEngineCtrl', ['$scope','$timeout', ControllerThisOrThatPlayer])
