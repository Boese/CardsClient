'use strict'
angular.module('cardsApp.socket', [])
  .factory('Service', ['$q','$rootScope',Service]);

function Service($q,$rootScope) {
  // We return this object to anything injecting our service
  var Service = {};
  // Create our websocket object with the address to the websocket
  var ws = new WebSocket("ws://localhost:5218");
  //var ws = new WebSocket("ws://10.0.2.2:3000");
  //var ws = new WebSocket("ws://76.14.226.157:5218")

  // Socket Opened
  ws.onopen = function(){
    console.log("Socket has been opened!");
  };

  ws.onclose = function() {
    console.log("Socket disconnected!");
  }

  // Parse response from Server
  ws.onmessage = function(message) {
    listener(JSON.parse(message.data));
  };

  // Send requests
  Service.send = function(request) {
    var defer = $q.defer();
    ws.send(JSON.stringify(request));
    return defer.promise;
  }

  // Emit events
  function listener(data) {
    if(data.response === 'salt')
      $rootScope.$broadcast('salt', {"salt": data.message});
    else if(data.response === 'response')
      $rootScope.$broadcast('response', {"response": data.message});
    else if(data.response === 'create_success')
      $rootScope.$broadcast('create_success', {"create_success": data.message});
    else if(data.response === 'session_id')
      $rootScope.$broadcast('session_id', {"session_id": data.message});
    else if(data.response === 'lobby')
      $rootScope.$broadcast('lobby', {"lobby": data});
    else if(data.response === 'game')
      $rootScope.$broadcast('game', {"game": data.game_message})
    else
      console.log('unkown response : ' + data)
  }

  return Service;
};
