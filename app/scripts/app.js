'use strict'
angular.module('cardsApp', ['cardsApp.socket','cardsApp.controllers'])
  .config(function($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise("/login");

  $stateProvider
  .state('login', {
    abstract: true,
    templateUrl: 'partials/login.html',
    controller:'loginCtrl'
  })
  .state('login.login', {
    url: "/login",
    templateUrl: 'partials/login.login.html'
  })
  .state('login.create-account', {
    url: '/create-account',
    templateUrl: 'partials/login.create-account.html'
  })

});
