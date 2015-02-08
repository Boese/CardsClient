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

  $scope.$on('serverDown',function(event,args) {
    $state.go('main.login');
  })

  // Needed to animate in 3D, must change perpective at least 1 value every 100ms
  var animating;
  var interval;
  var _modPerspective = new Transitionable(10);
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
}
