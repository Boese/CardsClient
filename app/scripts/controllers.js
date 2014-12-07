'use strict'
angular.module('cardsApp.controllers', ['famous.angular', 'ui.router'])
  .controller('loginCtrl', ['$scope','$state','$famous','Service',loginCtrl]);

function loginCtrl($scope,$state,$famous,Service) {
  var Transitionable = $famous['famous/transitions/Transitionable'];
  var Easing = $famous['famous/transitions/Easing'];
  var bcrypt = new bCrypt();

  $scope.$on('new_message',function(event,args) {
    var message = args.message;
    $scope.$apply(function() {
      console.log('message : ', message);
    });
  });

  $scope.myTransitionable = new Transitionable([0, 0, 0]);
  $scope.item = {
    rotate: new Transitionable(0)
  };

  $scope.animate = function() {
    $scope.myTransitionable.set([1500, 0, 0], {duration: 500, curve: Easing.inBack})
    $scope.myTransitionable.set([-1500,0,0], {duration: 0, curve: Easing.inBack})
    $scope.myTransitionable.set([0, 0, 0], {duration: 500, curve: Easing.inBack})
  }

  $scope.spin = function(state) {
    if(state === 'create') {
      $scope.item.rotate.set(Math.PI * 2, {curve: Easing.inQuad, duration: 500}, function() {
        $state.go('login.create-account');
      })
      $scope.item.rotate.set(0, {duration:0, curve: Easing.inBack})
    } else {
      $scope.item.rotate.set(Math.PI * 2, {curve: Easing.inQuad, duration: 500}, function() {
        $state.go('login.login');
      })
      $scope.item.rotate.set(0, {duration:0, curve: Easing.inBack})
    }
  }

  $scope.forgotPassword = function() {
    alert('password reset link sent');
  }

  $scope.loginModel = {};
  $scope.login = function() {
    var salt = bcrypt.gensalt(12);
    bcrypt.hashpw($scope.loginModel['password'], salt, result, null);
  }

  function result(hash) {
    var loginPacket = {
      "request":"login",
      "user_name":$scope.loginModel['username'],
      "hash_password":hash
    }
    $scope.animate();
    Service.send(loginPacket);
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
