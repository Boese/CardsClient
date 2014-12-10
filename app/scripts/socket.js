'use strict'
angular.module('cardsApp.socket', [])
  .factory('Service', ['$q','$rootScope',Service]);

function Service($q,$rootScope) {
  // We return this object to anything injecting our service
  var Service = {};
  // Create our websocket object with the address to the websocket
  var ws = new WebSocket("ws://localhost:3000");
  //var ws = new WebSocket("ws://10.0.2.2:3000");

  ws.onopen = function(){
    console.log("Socket has been opened!");
  };

  ws.onmessage = function(message) {
    listener(JSON.parse(message.data));
  };

  Service.send = function(request) {
    var defer = $q.defer();
    console.log('Sending request', request);
    ws.send(JSON.stringify(request));
    return defer.promise;
  }

  function listener(data) {
    console.log("Received data from websocket : ", data);
    $rootScope.$broadcast('new_message', {"message": data});
  }

  return Service;
};
