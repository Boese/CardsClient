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
      templateUrl: 'partials/login.html'
    })
    .state('main.create-account', {
      url: '/create-account',
      templateUrl: 'partials/create-account.html'
    })
    .state('main.lobby', {
      url: '/lobby',
      templateUrl: 'partials/lobby.html'
    })
    .state('main.pinochle', {
      url: '/game-pinochle',
      templateUrl: 'partials/game.html',
      controller: 'pinochleCtrl'
    })

});
