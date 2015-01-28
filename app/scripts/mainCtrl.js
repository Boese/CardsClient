'use strict'
angular.module('cardsApp.mainCtrl', [])
  .controller('mainCtrl', ['$scope','$rootScope','$state','$famous','$interval','Service','$window',mainCtrl]);

function mainCtrl($scope,$rootScope,$state,$famous,$interval,Service,$window) {
  var Transform = $famous['famous/core/Transform'];
  var Modifier = $famous['famous/core/Modifier'];
  var Transitionable = $famous['famous/transitions/Transitionable'];
  var Easing = $famous['famous/transitions/Easing'];
  var SpringTransition = $famous['famous/transitions/SpringTransition'];
  var SnapTransition = $famous['famous/transitions/SnapTransition']
  Transitionable.registerMethod('spring', SpringTransition);
  Transitionable.registerMethod('snap', SnapTransition);

  // ** Properties (css);

  // Header Footer
  $scope.myHeader = {
    properties: {
      textAlign: 'center',
      fontSize: '20px'
    }
  }

  $scope.myFooter = {
    properties: {
      textAlign: 'center',
      fontSize: '15px'
    }
  }

  // Login/ Lobby
  $scope.flexibleLayoutOptions = {
    ratios: [1,2.5]
  }

  $scope.mySidebarFlexibleOptions = {
    direction: 1,
    ratios: [1,1,3]
  }

  $scope.myGridLayoutOptions = {
    dimensions: [2, 3]
  };

  $scope.mySidebar = {
    properties: {
      textAlign: 'center',
      fontSize: '20px',
      border: '2px solid white',
      paddingTop: '4%',
      backgroundColor: 'black',
      color: 'white'
    }
  }

  $scope.gameGridOption = {
    properties: {
      textAlign: 'center',
      fontSize: '20px',
      padding: '40px',
      border: '2px solid white'
    }
  }

  $scope.myGameSelect = {
    properties: {
      padding: '10px',
      textAlign: 'center',
      fontSize: '14px',
      border: '5px solid white',
      backgroundColor: 'blue',
      color: 'white',
      display: 'none'
    }
  }

  $scope.gamePlayGrid = {
    content : '↑',
    properties : {
      color: '#fc5c4f',
      fontSize : '50px',
      textAlign : 'center',
    }
  }

  $scope.scoreBoard = {
    properties : {
      color: 'white',
      backgroundColor: 'blue',
      fontSize : '14px',
      textAlign : 'center'
    }
  }

  $scope.player = {
    properties : {
      color:'yellow',
      fontSize:'20px',
      textAlign:'center'
    }
  }

  $scope.playerMeld = {
    properties : {
      color: 'pink',
      fontSize: '15px',
      textAlign: 'center'
    }
  }

  $scope.currentMessage = {
    properties : {
      color: 'white',
      fontSize: '13px'
    }
  }

  $scope.gameGridTopDown = {
    ratios: [1,2,1],
    direction: 1
  }

  $scope.gameGridMiddleRight = {
    ratios: [1,2,1]
  }

  $scope.gameGridTopRight = {
    ratios: [1,2,1]
  }

  $scope.cardsGrid = {
    dimensions : [6,2]
  }

  $scope.playersGrid = {
    ratios : [1,4],
    direction: 1
  }

  $scope.playersGridDisplay = {
    dimensions : [1,2]
  }



  var salt, session_id;
  var game_types, games;
  var bcrypt = new bCrypt();

  //** Events **//

  // Event salt received
  $scope.$on('salt',function(event,args) {
    salt = args.salt;
    $scope.login();
  })

  // Event recevied session_id
  $scope.$on('session_id',function(event,args) {
    session_id = args.session_id;
    $scope.animateDown();
  })

  // Event response
  $scope.$on('response',function(event,args) {
    var response = args.response;
    $scope.login();
    $scope.animateBack();
    $scope.message = response;
  })

  // Event Created account
  $scope.$on('create_success',function(event,args) {
    var create_success = args.create_success;
    $scope.login();
    $state.go('main.login')
  })

  // Event lobby info received
  $scope.$on('lobby',function(event,args) {
    var lobby = args.lobby;
    game_types = lobby.game_types;
    games = lobby.games;
    loadGames()
    loadGameTypes()
  })

  // ** Login ** //

  var isToggled = false;
  var defaultAngle = -Math.PI/2.5;
  var angle = new Transitionable(0);

  var _modPerspective = new Transitionable(10);
  $scope.modPerspective = function(){
    return _modPerspective.get();
  }

  $scope.myTransform = function() {
    return Transform.rotateY(angle.get());
  }

  $scope.myAngle = function() {
    return new Transitionable(angle.get());
  }

  var angle = new Transitionable(0);
  $scope.toggle = function() {
    var animating = true;
    var interval = $interval(function() {
      if(animating) {
        _modPerspective.set(1000)
        animating = false;
      }
      else {
        _modPerspective.set(999)
        animating = true;
      }
    }, 60);
    var targetAngle = isToggled ? defaultAngle : -defaultAngle;

    if (angle.isActive()) angle.halt();

    angle.set(targetAngle, { duration: 1000, curve: 'easeInOut' }, function() {
      isToggled ? $state.go('main.create-account') : $state.go('main.login')
      angle.set(0, { duration: 1000, curve: 'easeInOut' }, function() {
        $interval.cancel(interval);
        interval = undefined;
      })
    });
    isToggled = !isToggled;
  }

  $scope.forgotPassword = function() {
    alert('password reset link sent');
  }

  $scope.$watch(session_id, function() {
    if(session_id === undefined) {
      $state.go('main.login')
    }
  })

  $scope.loginModel = {};
  $scope.login = function() {
    if(salt === undefined) {
      $scope.message = 'Please wait loading account ...'
      var loginPacket = {
        "request":"send_salt",
        "user_name":$scope.loginModel['username']
      }
      Service.send(loginPacket);
    }
    else {
      console.log('salt : ' + salt);
      $scope.message = 'Please wait loading account ...'
      bcrypt.hashpw($scope.loginModel['password'], salt, loginResult, null);
    }
  }

  function loginResult(hash) {
    var loginPacket = {
      "request":"login",
      "user_name":$scope.loginModel['username'],
      "hash_password":hash
    }
    $scope.animateRight();
    Service.send(loginPacket);
    salt = undefined;
  }

  $scope.createAccount = function() {
    console.log('create-account')
    var salt = messageObject['salt'];
    if(salt === undefined) {
      $scope.message = 'Please wait creating account ...'
      console.log('need salt');
      var loginPacket = {
        "request":"send_salt"
      }
      Service.send(loginPacket);
    }
    else {
      console.log('salt : ' + salt);
      $scope.message = 'Please wait loading account ...'
      bcrypt.hashpw($scope.loginModel['password'], salt, createResult, null);
    }
  }

  function createResult(hash) {
    var loginPacket = {
      "request":"create_account",
      "email":$scope.loginModel['email'],
      "user_name":$scope.loginModel['username'],
      "hash_password":hash
    }
    $scope.animateLeft();
    Service.send(loginPacket);
    messageObject['salt'] = undefined;
  }

  // ** Login animations
  $scope.bodyTransitionable = new Transitionable([0, 0, 0]);

  $scope.animateRight = function() {
    $scope.bodyTransitionable.set([-1500, 0, 0], {duration: 500, curve: Easing.inBack})
  }

  $scope.animateLeft = function() {
    $scope.bodyTransitionable.set([1500, 0, 0], {duration: 500, curve: Easing.inBack})
  }

  $scope.animateDown = function() {
    $scope.bodyTransitionable.set([0,-1500,0], {duration: 0, curve: Easing.inBack}, function() {
      $state.go('main.lobby')
      $scope.bodyTransitionable.set([0, 0, 0], {duration: 2000, curve: Easing.inQuad})
    })
  }

  $scope.animateBack = function() {
    $scope.bodyTransitionable.set([0, 0, 0], {duration: 500, curve: Easing.inBack})
  }

  // ** Lobby ** //

  $scope.scales = [
{scale: new Transitionable([1, 1, 1])},
{scale: new Transitionable([1, 1, 1])}
]
var angles = [];
$scope.list = [];

$scope.toggleLobby = function(index,game) {
  var that = this;
  that.game = game;
  var animating = true;
  var interval = $interval(function() {
    if(animating) {
      _modPerspective.set(1000)
      animating = false;
    }
    else {
      _modPerspective.set(999)
      animating = true;
    }
  }, 60);
  var targetAngle = -defaultAngle;

  if (angles[index].angle.isActive()) angle.halt();

  var angle = angles[index].angle;
  angle.set(targetAngle, { duration: 700, curve: 'easeInOut' }, function() {
    angle.set(0, { duration: 700, curve: 'easeInOut' }, function() {
      var state = ('main.' + that.game).toLowerCase()
      $state.go(state)
      $interval.cancel(interval);
      interval = undefined;
    })
  });
}

$scope.myTransformLobby = function(index) {
  return Transform.rotateY(angles[index].angle.get());
}

$scope.myAngleLobby = function(index) {
  return new Transitionable(angles[index].angle.get());
}

var EventHandler = $famous['famous/core/EventHandler'];
$scope.eventHandler = new EventHandler();

// ** Lobby functions
$scope.joinGame = function(index) {
  var lobbyPacket = {
    "request":"join_game",
    "session_id":session_id,
    "game_id":games[index].game_id
  }
  Service.send(lobbyPacket);
}

$scope.randomGame = function() {
  var lobbyPacket = {
    "request":"random_game",
    "session_id":session_id,
    "game_type":game_types[index]
  }
  Service.send(lobbyPacket);
}

$scope.newGame = function(index) {
  var lobbyPacket = {
    "request":"new_game",
    "session_id":session_id,
    "game_type":game_types[index]
  }
  Service.send(lobbyPacket);
  var game = ('main.' + game_types[index]).toLowerCase()
  $state.go(game);
}

$scope.lobbyButtonClick = function(index){
  $scope.myGameSelect.properties.display = '';
  this.index = index;
  var that = this;
  var transition = {
    method: 'snap',
    period: 100,
    dampingRatio: 0.1
  }
  $scope.scales[that.index]['scale'].set([1.1, 1.1, 1.1], transition, function() {
    $scope.scales[that.index]['scale'].set([1, 1, 1], transition)
  });
  $scope.gameSelect(true)
}

$scope.gameSelect = function(on) {

  var spring = {
    method: 'snap',
    period: 300,
    dampingRatio: 1
  };
  on ? $scope.selectGameTransition.set([0,0,0], spring) :
  $scope.selectGameTransition.set([0,800,0], spring, function() {
    $scope.myGameSelect.properties.display = 'none';
  })
}

$scope.selectGameTransition = new Transitionable([0,800,0]);

// Load Games from Server
function loadGames() {
  $scope.list = [];
  var i = 0;
  for(var key in games) {
    var temp = {};
    var angle = {};
    temp['game_id'] = games[key]['game_id']
    temp['game_type'] = games[key]['game_type']
    temp['num_players'] = games[key]['num_players']
    temp['color'] = colors[i%6].color;
    $scope.list.push(temp)
    angle['angle'] = new Transitionable(0)
    angles.push(angle);
    i++;
  }

  // Update Games Grid layout
  $scope.myGridLayoutOptions = {
    dimensions: [2, ($scope.list.length/2)]
  }
}

// Load Game Types
function loadGameTypes() {
  $scope.gameTypes = [];
  for(var key in game_types) {
    var temp = {}
    temp['game_type'] = game_types[key];
    $scope.gameTypes.push(temp);
  }
}

var colors = [
{color:"#b58900"},
{color:"#cb4b16"},
{color:"#dc322f"},
{color:"#d33682"},
{color:"#6c71c4"},
{color:"#268bd2"},
]

// ** Properties (css)

// Event game received
$scope.$on('game',function(event,args) {
  var game = args.game;
  $scope.bidding = false;
  $scope.trump = false;
  $scope.passing = false;
  $scope.round = false;

  if(game.currentState === 'Pause')
    Pause(game);
  else if(game.currentState === 'Deal')
    Deal(game);
  else if(game.currentState === 'Bid')
    Bid(game);
  else if(game.currentState === 'Trump')
    Trump(game);
  else if(game.currentState === 'Pass')
    Pass(game);
  else if(game.currentState === 'Meld')
    Meld(game);
  else if(game.currentState === 'Round')
    Round(game);
  else if(game.currentState === 'Gameover')
    Gameover(game);
  $scope.lastMove = game.lastMove
  setArrow(game.currentTurn);
})

$scope.arrow = function() {
  return Transform.rotateZ(arrow);
}

var arrow = Math.PI/2;
function setArrow(currentTurn) {
  $scope.currentTurn = currentTurn;
  var arrows = {};
  arrows['North'] = 0;
  arrows['East'] = Math.PI/2;
  arrows['South'] = Math.PI;
  arrows['West'] = Math.PI + Math.PI/2;

  arrow = arrows[currentTurn];
  $scope.$apply()
}

// Send Move
$scope.sendBid = function(number) {
  var gamePacket = {
    "request":"play",
    "session_id":session_id,
    "move": {
      "bid": number
    }
  }
  Service.send(gamePacket);
}

$scope.sendTrump = function(trump) {
  var gamePacket = {
    "request":"play",
    "session_id":session_id,
    "move": {
      "trump": trump
    }
  }
  Service.send(gamePacket);
}

// Game
$scope.cardStyles = []
var cards = []
$scope.addRemoveCards = function(index) {
  $scope.cardStyles[index].properties.border = '4px solid yellow';
  $scope.cardStyles[index].properties.borderRadius = '10px';

  if($scope.passing) {
    if(cards.indexOf($scope.cards[index] === -1))
      cards.push($scope.cards[index]);

      if(cards.length > 3) {
        for(var key in $scope.cards) {
          $scope.cardStyles.push({
            properties: {
              color: 'black',
              backgroundColor: 'white',
              textAlign: 'center',
              fontSize: '10px',
              border: '2px solid black',
              borderRadius: '5px'
            }}
          )
        }
        passCards(cards);
      }
  }
  if($scope.round) {
    cards = [];
    cards.push($scope.cards[index]);
    passCards(cards)
  }

}

function passCards(cards) {
  var gamePacket = {
    "request":"play",
    "session_id":session_id,
    "move": {
      "cards": cards
    }
  }
  Service.send(gamePacket);
  cards = []
}

$scope.playCard = function(card) {
  var gamePacket = {
    "request":"play",
    "session_id":session_id,
    "move": {
      "card":card
    }
  }
  Service.send(gamePacket);
}

// ** Game Functions
function Pause(message) {
  $scope.players = [];
  $scope.players = message.players
  var playerCount = 0;
  for(var key in $scope.players)
    playerCount++;
  var playersRemaining = 4 - playerCount;
  $scope.game_message = 'Waiting for ' + playersRemaining + ' more players';
}

function Deal(message) {
  $scope.dealing = true;
  $scope.cards = [];
  $scope.game_message = 'Dealing ... '
  setTimeout(function deal() {
    $scope.cardStyles = [];
    $scope.dealing = false;
    $scope.game_message = 'Bidding .. ';
    $scope.cards = message.cards;
    $scope.cardStyles = [];
    for(var key in $scope.cards) {
      $scope.cardStyles.push({
        properties: {
          color: 'black',
          backgroundColor: 'white',
          textAlign: 'center',
          fontSize: '10px',
          border: '2px solid black',
          borderRadius: '5px'
        }}
      )
    }
    $scope.$apply();
  }, 3*1000)
}

function Bid(message) {
  if(message.currentTurn === 'South')
    $scope.bidding = true;
}


function Trump(message) {
  $scope.game_message = 'Selecting Trump ... '
  if(message.currentTurn === 'South')
    $scope.trump = true;
}

function Pass(message) {
  $scope.game_message = 'Passing 4 cards .. '
  $scope.cards = message.cards;
  if(message.currentTurn === 'South')
    $scope.passing = true;

  $scope.cardsGrid.dimensions = [$scope.cards.length/2,2]

  $scope.cardStyles = [];
  for(var key in $scope.cards) {
    $scope.cardStyles.push({
      properties: {
        color: 'black',
        backgroundColor: 'white',
        textAlign: 'center',
        fontSize: '10px',
        border: '2px solid black',
        borderRadius: '5px'
      }}
    )
  }
}

function Meld(message) {
  $scope.game_message = 'Showing Meld ... '
  $scope.playersMeld = message.playersMeld;
  $scope.team1Score = message.team1Score;
  $scope.team2Score = message.team2Score;
}

function Round(message) {
  $scope.game_message = 'Playing Round ... '
  $scope.team1Score = message.team1Score;
  $scope.team2Score = message.team2Score;
  $scope.cards = message.cards;
  $scope.cardsGrid.dimensions = [6,2]
  $scope.cardStyles = [];
  for(var key in $scope.cards) {
    $scope.cardStyles.push({
      properties: {
        color: 'black',
        backgroundColor: 'white',
        textAlign: 'center',
        fontSize: '10px',
        border: '2px solid black',
        borderRadius: '5px'
      }}
    )
  }

  if(message.currentTurn === 'South')
    $scope.round = true;
}

function Gameover(message) {
  $scope.game_message = 'Gameover'
}

//****//


}
