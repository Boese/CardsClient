'use strict'
angular.module('cardsApp.controllers', ['famous.angular', 'ui.router'])
  .controller('mainCtrl', ['$scope','$rootScope','$state','$famous','$interval','Service',mainCtrl]);

function mainCtrl($scope,$rootScope,$state,$famous,$interval,Service) {
  var Transform = $famous['famous/core/Transform'];
  var Transitionable = $famous['famous/transitions/Transitionable'];
  var Easing = $famous['famous/transitions/Easing'];
  var SpringTransition = $famous['famous/transitions/SpringTransition'];
  Transitionable.registerMethod('spring', SpringTransition);

  $scope.guessNumber = function(number) {
    console.log(number);
    var gamePacket = {
      "request":"play",
      "session_id":messageObject['session_id'],
      "move": {
        "bid":number
      }
    }
    Service.send(gamePacket);
  }

  var bcrypt = new bCrypt();

  // ** Properties (css)
  $scope.mySidebarFlexibleOptions = {
    direction: 1,
    ratios: [1,1,3]
  }

  $scope.myGridLayoutOptions = {
    dimensions: [2, 3]
  };

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

  $scope.myGameSelect = {
    properties: {
      padding: '10px',
      textAlign: 'center',
      fontSize: '14px',
      border: '5px solid white',
      backgroundColor: '#fc5c4f',
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

  $scope.currentMessage = {
    properties: {
      textAlign: 'center',
      fontSize: '12px',
      padding: '2px',
      border: '2px solid black',
      borderRadius: '25px'
    }
  }

  $scope.cardStyle = {
    properties: {
      textAlign: 'center',
      fontSize: '14px',
      border: '2px solid black',
      borderRadius: '10px'
    }
  }

  $scope.gamePlayGrid = {
    content : '↑',
    properties : {
      color: '#fc5c4f',
      fontSize : '80px',
      textAlign : 'center',
    }
  }

  $scope.player = {
    properties : {
      color:'white',
      fontSize:'20px',
      textAlign:'center'
    }
  }

  $scope.guessTheNumberOptions = {
    properties : {
      color: 'white',
      fontSize:'30px',
      textAlign:'center'
    }
  }

  $scope.flexibleLayoutOptions = {
    ratios: [1,2.5]
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

  $scope.arrow = function() {
    return Transform.rotateZ(arrow);
  }

  $scope.players = {};
  var arrow = Math.PI/2;

  function setArrow() {
    $scope.players = $scope.gameObject['players'];

    var arrows = {};
    arrows['North'] = 0;
    arrows['East'] = Math.PI/2;
    arrows['South'] = Math.PI;
    arrows['West'] = Math.PI + Math.PI/2;

    arrow = arrows[$scope.gameObject['currentTurn']];
  }

  $scope.playCard = function(index) {
    var card = $scope.gameObject['cards'][index];
    var gamePacket = {
      "request":"play",
      "session_id":messageObject['session_id'],
      "move": {
        "card":$scope.gameObject['cards'][index]
      }
    }
    Service.send(gamePacket);
  }

  // ** Lobby animations

  $scope.scales = [
    {scale: new Transitionable([1, 1, 1])},
    {scale: new Transitionable([1, 1, 1])}
  ]

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
      "session_id":messageObject['session_id'],
      "game_id":messageObject['games'][index]['game_id']
    }
    Service.send(lobbyPacket);
  }

  $scope.randomGame = function() {
    var lobbyPacket = {
      "request":"random_game",
      "session_id":messageObject['session_id'],
      "game_type":messageObject['game_types'][0]
    }
    Service.send(lobbyPacket);
  }

  $scope.newGame = function(index) {
      var lobbyPacket = {
        "request":"new_game",
        "session_id":messageObject['session_id'],
        "game_type":messageObject['game_types'][index]
      }
      Service.send(lobbyPacket);
      var game = ('main.' + messageObject['game_types'][index]).toLowerCase()
      $state.go(game);
  }

  $scope.lobbyButtonClick = function(index){
    this.index = index;
    var that = this;
    var spring = {
      method: 'spring',
      period: 500,
      dampingRatio: 0.3
    }
    $scope.scales[that.index]['scale'].set([1.1, 1.1, 1.1], spring, function() {
      $scope.scales[that.index]['scale'].set([1, 1, 1], spring)
    });
    $scope.gameSelect(true)
  }

  $scope.gameSelect = function(on) {
    var spring = {
      method: 'spring',
      period: 700,
      dampingRatio: 0.5
    };
    on ? $scope.selectGameTransition.set([0,0,0], spring) :
      $scope.selectGameTransition.set([1500,1500,0], {duration:700, curve:Easing.inBack})
  }

  $scope.selectGameTransition = new Transitionable([1500,1500,0]);


  // ** Login animations

  var isToggled = false;
  var defaultAngle = -Math.PI/2.5;
  var angle = new Transitionable(0);

  var _modPerspective = new Transitionable(10);
  $scope.modPerspective = function(){
    return _modPerspective.get();
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

  $scope.myTransform = function() {
    return Transform.rotateY(angle.get());
  }

  $scope.myAngle = function() {
    return new Transitionable(angle.get());
  }

  $scope.myTransitionable = new Transitionable([0, 0, 0]);

  $scope.animateRight = function() {
    $scope.myTransitionable.set([-1500, 0, 0], {duration: 500, curve: Easing.inBack})
  }

  $scope.animateLeft = function() {
    $scope.myTransitionable.set([1500, 0, 0], {duration: 500, curve: Easing.inBack})
  }

  $scope.animateDown = function() {
    $scope.myTransitionable.set([0,-1500,0], {duration: 0, curve: Easing.inBack}, function() {
      $state.go('main.lobby')
      $scope.myTransitionable.set([0, 0, 0], {duration: 2000, curve: Easing.inQuad})
    })
  }

  $scope.animateBack = function() {
    $scope.myTransitionable.set([0, 0, 0], {duration: 500, curve: Easing.inBack})
  }

  //** Socket Listener

  var messageObject = {};
  $scope.message;

  $rootScope.$on('$stateChangeStart',
  function(event, toState, toParams, fromState, fromParams){
    $scope.message = '';
  })

  $scope.$on('new_message',function(event,args) {
    var data = args.message;
    $scope.$apply(function() {
      if(data.response === 'salt') {
        console.log('received message type salt : ' + data.message)
        messageObject['salt'] = data.message
        $scope.login();
      }
      if(data.response === 'response') {
        console.log('received message type response')
        messageObject['message'] = data.message;
        $scope.animateBack();
        $scope.message = messageObject['message'];
      }
      if(data.response === 'create_success') {
        console.log('received message type create_success')
        messageObject['message'] = data.message
        $scope.message = message.message
        $state.go('main.login')
      }
      if(data.response === 'session_id') {
        console.log('received message type session_id : ' + data.message)
        delete messageObject['salt']
        messageObject['session_id'] = data.message
        $scope.message = "success!"
        $scope.animateDown()
      }
      if(data.response === 'lobby') {
        console.log('received message lobby')
        messageObject['game_types'] = data.game_types
        messageObject['games'] = data.games
        loadGames()
        loadGameTypes()
      }
      if(data.response === 'game') {
        console.log('received message game')
        messageObject['game_message'] = data.game_message
        $scope.gameObject = messageObject['game_message']
        var positions = $scope.gameObject['players'];
        setArrow();
      }
      if(data.response === 'gameover') {
        console.log('received message gameover')
        $scope.gameObject = {}
        $state.go('main.lobby')
      }
    });
  });

  $scope.gameObject = {}

  var colors = [
  {color:"#b58900"},
  {color:"#cb4b16"},
  {color:"#dc322f"},
  {color:"#d33682"},
  {color:"#6c71c4"},
  {color:"#268bd2"},
  ]

  var angles = [];
  $scope.list = [];
  // Load Games from Server
  function loadGames() {
    $scope.list = [];
    var games = messageObject['games']
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
  $scope.gameTypes = [];
  function loadGameTypes() {
    $scope.gameTypes = [];
    var gameTypes = messageObject['game_types'];
    for(var key in gameTypes) {
      var temp = {}
      temp['game_type'] = gameTypes[key];
      $scope.gameTypes.push(temp);
    }
  }

  //** Login/Create Functions

  $scope.forgotPassword = function() {
    alert('password reset link sent');
  }

  $scope.loginModel = {};
  $scope.login = function() {
    var salt = messageObject['salt'];
    if(salt === undefined) {
      $scope.message = 'Please wait loading account ...'
      console.log('need salt');
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
    messageObject['salt'] = undefined;
  }

  $scope.createAccount = function() {
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


  $scope.$watch(messageObject['session_id'], function() {
    if(messageObject['session_id'] === undefined) {
      $state.go('main.login')
    }
  })

}

/*
// REQUIRED
private String request;

// OPTIONAL
private String user_name;
private String email;
private String hash_password;
private String session_id;
private String game_type;
private String game_id;
private PlayerResponse move;
*/

/*
$scope.spin = function(state) {
if(state === 'create') {
$scope.item.rotate.set(Math.PI * 2, {curve: Easing.inQuad, duration: 500}, function() {
$state.go('main.create-account');
})
$scope.item.rotate.set(0, {duration:0, curve: Easing.inBack})
} else {
$scope.item.rotate.set(Math.PI * 2, {curve: Easing.inQuad, duration: 500}, function() {
$state.go('main.login');
})
$scope.item.rotate.set(0, {duration:0, curve: Easing.inBack})
}
}
*/
