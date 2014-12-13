'use strict'
angular.module('cardsApp', ['cardsApp.socket','cardsApp.controllers'])
  .config(function($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise("/login");

  $stateProvider
  .state('main', {
    abstract: true,
    templateUrl: 'partials/main.html',
    controller:'mainCtrl'
  })
  .state('main.login', {
    url: "/login",
    templateUrl: 'partials/main.login.html'
  })
  .state('main.create-account', {
    url: '/create-account',
    templateUrl: 'partials/main.create-account.html'
  })
  .state('main.lobby', {
    url: '/lobby',
    templateUrl: 'partials/main.lobby.html'
  })
  .state('main.pinochle', {
    url: '/game-pinochle',
    templateUrl: 'partials/main.game.html'
  })
  .state('main.guessthenumber', {
    url: '/game-guessthenumber',
    templateUrl: 'partials/main.guessTheNumber.html'
  })

});
