'use strict'
angular.module('cardsApp.controllers', ['famous.angular', 'ui.router'])
  .controller('mainCtrl', ['$scope','$rootScope','$state','$famous','$interval','Service',mainCtrl]);

function mainCtrl($scope,$rootScope,$state,$famous,$interval,Service) {
  var Transform = $famous['famous/core/Transform'];
  var Transitionable = $famous['famous/transitions/Transitionable'];
  var Easing = $famous['famous/transitions/Easing'];
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

  $scope.gameGridOption = {
    properties: {
      textAlign: 'center',
      fontSize: '20px',
      padding: '40px',
      border: '2px solid white'
    }
  }

  $scope.flexibleLayoutOptions = {
    ratios: [1,2.5]
  }

  // ** Lobby animations
  var angles = [
  {angle : new Transitionable(0)},
  {angle : new Transitionable(0)},
  {angle : new Transitionable(0)},
  {angle : new Transitionable(0)},
  {angle : new Transitionable(0)},
  {angle : new Transitionable(0)}
  ];

  $scope.toggleLobby = function(index) {
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
        $state.go('main.game')
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

  $scope.list = [
  {content: "Pinochle", color:"#b58900", players: '3'},
  {content: "Hearts", color:"#cb4b16", players: '2'},
  {content: "Hearts", color:"#dc322f", players: '1'},
  {content: "Pinochle", color:"#d33682", players: '3'},
  {content: "Pinochle", color:"#6c71c4", players: '2'},
  {content: "Hearts", color:"#268bd2", players: '2'}
  ];

  // ** Lobby functions

  $scope.joinGame = function(index) {
    var lobbyPacket = {
      "request":"join_game",
      "session_id":messageObject['session_id'],
      "game_id":messageObject['games'][index]
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

  $scope.newGame = function() {
    var lobbyPacket = {
      "request":"new_game",
      "session_id":messageObject['session_id'],
      "game_type":messageObject['game_types'][0]
    }
    Service.send(lobbyPacket);
  }

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
      }
      if(data.response === 'game') {
        console.log('received message game')
        messageObject['game_message'] = data.game_message
      }
    });
  });


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
