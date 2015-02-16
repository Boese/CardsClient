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
      fontSize: '20px',
      backgroundColor: '#fc5c4f',
      color: 'white'
    }
  }

  $scope.myFooter = {
    properties: {
      textAlign: 'center',
      fontSize: '15px',
      backgroundColor: '#fc5c4f',
      color: 'black'
    }
  }

  // New Games list
  var game_types,games;
  $scope.$on('lobby',function(event,args) {
    var lobby = args.lobby;
    game_types = lobby.game_types;
    games = lobby.games;
  })

  $scope.$on('getGames', function(event,args) {
    $rootScope.$broadcast('lobby', {lobby:{games:games,game_types:game_types}})
  })

  // If session_id is undefined, go to Login
  var session_id;
  $scope.$on('session_id',function(event,args) {
    session_id = args.session_id;
  })

/*
  $scope.$watch(session_id, function() {
    if(session_id === undefined) {
      $state.go('main.login')
    }
  })
*/
  $scope.$on('getSession', function(event,args) {
    $rootScope.$broadcast('session',{session_id:session_id})
  })

  // Animate body
  $scope.bodyTransitionable = new Transitionable([0, 0, 0]);
  $scope.$on('animateBody', function(event,args) {
    var transition = args.transition;
    $scope.bodyTransitionable.set([0,1000,0], {duration:1500, curve: Easing.outBack}, function() {
      $state.go(transition.to);
      $scope.bodyTransitionable.set([0, -1000, 0], {duration:0, curve: Easing.inBack}, function() {
        $scope.bodyTransitionable.set([0,0,0], {duration:1500, curve:Easing.inBack})
      })
    })
  })

  // Needed to animate in 3D, must change perpective at least 1 value every 100ms
  var animating;
  var interval;
  var _modPerspective = new Transitionable(1000);
  $scope.modPerspective = function(){
    return _modPerspective.get();
  }
  $scope.$on('animating',function(event,args) {
    animating = true;
    interval = $interval(function() {
      if(animating) {
        _modPerspective.set(1000)
        animating = false;
      }
      else {
        _modPerspective.set(999)
        animating = true;
      }
    }, 100);
  })

  $scope.$on('stopAnimating',function(event,args) {
    animating = false;
    $interval.cancel(interval);
    interval = undefined;
  })

  // ANIMATIONS

}
