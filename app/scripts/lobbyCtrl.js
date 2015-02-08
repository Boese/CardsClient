'use strict'
angular.module('cardsApp.lobbyCtrl', [])
  .controller('lobbyCtrl', ['$scope','$rootScope','$state','$famous','$interval','Service','$window',lobbyCtrl]);

function lobbyCtrl($scope,$rootScope,$state,$famous,$interval,Service,$window) {
  var Transform = $famous['famous/core/Transform'];
  var Modifier = $famous['famous/core/Modifier'];
  var Transitionable = $famous['famous/transitions/Transitionable'];
  var Easing = $famous['famous/transitions/Easing'];
  var SpringTransition = $famous['famous/transitions/SpringTransition'];
  var SnapTransition = $famous['famous/transitions/SnapTransition']
  Transitionable.registerMethod('spring', SpringTransition);
  Transitionable.registerMethod('snap', SnapTransition);

  var game_types, games;

  // Event lobby info received
  $scope.$on('lobby',function(event,args) {
    var lobby = args.lobby;
    game_types = lobby.game_types;
    games = lobby.games;
    loadGames()
    loadGameTypes()
  })

  // Event response
  $scope.$on('response',function(event,args) {
    var response = args.response;
    $scope.login();
    $scope.animateBack();
    $scope.message = response;
  })

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
}
