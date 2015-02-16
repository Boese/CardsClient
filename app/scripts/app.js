'use strict'
angular.module('cardsApp', ['cardsApp.socket','cardsApp.controllers','ui.bootstrap','angular-underscore'])
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
      templateUrl: 'partials/login.html',
      controller: 'loginCtrl'
    })
    .state('main.lobby', {
      url: '/lobby',
      templateUrl: 'partials/lobby.html',
      controller: 'lobbyCtrl'
    })
    .state('main.game', {
      url: '/game',
      templateUrl: 'partials/game.html',
      controller: 'GameCtrl'
    })

});
