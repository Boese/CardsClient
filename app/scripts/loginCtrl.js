'use strict'
angular.module('cardsApp.loginCtrl', [])
  .controller('loginCtrl', ['$scope','$rootScope','$state','$famous','$interval','Service','$window',loginCtrl]);

function loginCtrl($scope,$rootScope,$state,$famous,$interval,Service,$window) {
  var Transform = $famous['famous/core/Transform'];
  var Modifier = $famous['famous/core/Modifier'];
  var Transitionable = $famous['famous/transitions/Transitionable'];
  var Easing = $famous['famous/transitions/Easing'];
  var SpringTransition = $famous['famous/transitions/SpringTransition'];
  var SnapTransition = $famous['famous/transitions/SnapTransition']
  Transitionable.registerMethod('spring', SpringTransition);
  Transitionable.registerMethod('snap', SnapTransition);

  var touchstartX = 0;
  var touchstartY = 0;
  var angle = new Transitionable(0);
  var scale = 0;

  $scope.loginState = {
    login : 'Login',
    create: false
  }

  // Transform for angled rotation
  $scope.loginAngleTransform = function() {
    return Transform.rotateY(angle.get());
  }

  // Transform scale for pulling down
  $scope.loginScaleTransform = function() {
    return Transform.scale(1+scale,1-scale,1);
  }

  // Capture touch start in X and Y
  $scope.loginTouchStart = function($event) {
    $rootScope.$broadcast('animating');
    touchstartX = $event.changedTouches[0].clientX;
    touchstartY = $event.changedTouches[0].clientY;
  }

  // Update transforms based on state and X vs Y direction
  $scope.loginTouchMove = function($event) {
    var deltaX = $event.changedTouches[0].clientX - touchstartX;
    var deltaY = $event.changedTouches[0].clientY - touchstartY;

    // User is swiping in X direction
    if(Math.abs(deltaX) > Math.abs(deltaY)) {
      if(!$scope.loginState.create) {
        if(deltaX < 0 && deltaX > -100) {
          angle.set(-deltaX*.01);
        }
      }

      else {
        if(deltaX > 0 && deltaX < 100) {
          angle.set(-deltaX*.01);
        }
      }
    }
    // User is swiping in Y direction
    else {
      if(deltaY <= 200 && deltaY >= 0)
        scale = deltaY*.001
    }
  }

  // Handle touch end to see if state transition has occured
  $scope.loginTouchEnd = function($event) {
    var deltaX = $event.changedTouches[0].clientX - touchstartX;
    var deltaY = $event.changedTouches[0].clientY - touchstartY;

    if(!$scope.loginState.create) {
      if(deltaX < -100) {
        $scope.loginState.create = true;
        $scope.loginState.login = 'Create Account';
      }
      else if(deltaY > 200)
        login();
    }

    else {
      if(deltaX > 100) {
        $scope.loginState.create = false;
        $scope.loginState.login = 'Login';
      }
      else if(deltaY > 200)
        createAccount();
    }

    angle.set(0, {duration:200, curve:Easing.inBack});
    scale = 0;
    $rootScope.$broadcast('stopAnimating');
  }

  // Login css
  $scope.loginSurface = {
    properties: {
      color: '#fc5c4f',
      backgroundColor: 'white',
      padding: '5% 20% 5% 20%'
    }
  }

  // Event salt received
  $scope.$on('salt',function(event,args) {
    salt = args.salt;
    login();
  })

  // Event recevied session_id
  $scope.$on('session_id',function(event,args) {
    session_id = args.session_id;
    $state.go('main.lobby')
  })

  // Event Created account
  $scope.$on('create_success',function(event,args) {
    var create_success = args.create_success;
    login();
    $state.go('main.login')
  })

  // Event response
  $scope.$on('response',function(event,args) {
    var response = args.response;
    $scope.message = response;
  })

  // Server Down
  $scope.$on('serverDown', function(event,args) {
    $scope.message = 'Server is down...';
  })

  var salt, session_id;
  var bcrypt = new bCrypt();

  $scope.loginModel = {};
  function login() {
    if(salt === undefined) {
      var loginPacket = {
        "request":"send_salt",
        "user_name":$scope.loginModel['username']
      }
      Service.send(loginPacket);
      $scope.message = 'Please wait loading account ...'
    }
    else {
      console.log('salt : ' + salt);
      bcrypt.hashpw($scope.loginModel['password'], salt, loginResult, null);
    }
  }

  function loginResult(hash) {
    var loginPacket = {
      "request":"login",
      "user_name":$scope.loginModel['username'],
      "hash_password":hash
    }
    Service.send(loginPacket);
    salt = undefined;
  }

  function createAccount() {
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
    Service.send(loginPacket);
    messageObject['salt'] = undefined;
  }
}
