'use strict'
angular.module('cardsApp.pinochleCtrl', [])
  .controller('pinochleCtrl', ['$scope','$rootScope','$state','$famous','$interval','Service','$window',pinochleCtrl]);

function pinochleCtrl($scope,$rootScope,$state,$famous,$interval,Service,$window) {
  var Transform = $famous['famous/core/Transform'];
  var Modifier = $famous['famous/core/Modifier'];
  var Transitionable = $famous['famous/transitions/Transitionable'];
  var Easing = $famous['famous/transitions/Easing'];
  var SpringTransition = $famous['famous/transitions/SpringTransition'];
  var SnapTransition = $famous['famous/transitions/SnapTransition']
  Transitionable.registerMethod('spring', SpringTransition);
  Transitionable.registerMethod('snap', SnapTransition);

  // Event response
  $scope.$on('response',function(event,args) {
    var response = args.response;
    $scope.login();
    $scope.animateBack();
    $scope.message = response;
  })

  $scope.$on('game',function(event,args) {
    var game = args.game;
    $scope.bidding = false;
    $scope.trump = false;
    $scope.passing = false;
    $scope.round = false;

    if(game.currentState === 'Pause')
      Pause(game);
    else if(game.currentState === 'Deal')
      Deal(game);
    else if(game.currentState === 'Bid')
      Bid(game);
    else if(game.currentState === 'Trump')
      Trump(game);
    else if(game.currentState === 'Pass')
      Pass(game);
    else if(game.currentState === 'Meld')
      Meld(game);
    else if(game.currentState === 'Round')
      Round(game);
    else if(game.currentState === 'Gameover')
      Gameover(game);
    $scope.lastMove = game.lastMove
    setArrow(game.currentTurn);
  })

  $scope.arrow = function() {
    return Transform.rotateZ(arrow);
  }

  var arrow = Math.PI/2;
  function setArrow(currentTurn) {
    $scope.currentTurn = currentTurn;
    var arrows = {};
    arrows['North'] = 0;
    arrows['East'] = Math.PI/2;
    arrows['South'] = Math.PI;
    arrows['West'] = Math.PI + Math.PI/2;

    arrow = arrows[currentTurn];
    $scope.$apply()
  }

  // Send Move
  $scope.sendBid = function(number) {
    var gamePacket = {
      "request":"play",
      "session_id":session_id,
      "move": {
        "bid": number
      }
    }
    Service.send(gamePacket);
  }

  $scope.sendTrump = function(trump) {
    var gamePacket = {
      "request":"play",
      "session_id":session_id,
      "move": {
        "trump": trump
      }
    }
    Service.send(gamePacket);
  }

  // Game
  $scope.cardStyles = []
  var cards = []
  $scope.addRemoveCards = function(index) {
    $scope.cardStyles[index].properties.border = '4px solid yellow';
    $scope.cardStyles[index].properties.borderRadius = '10px';

    if($scope.passing) {
      if(cards.indexOf($scope.cards[index] === -1))
        cards.push($scope.cards[index]);

        if(cards.length > 3) {
          for(var key in $scope.cards) {
            $scope.cardStyles.push({
              properties: {
                color: 'black',
                backgroundColor: 'white',
                textAlign: 'center',
                fontSize: '10px',
                border: '2px solid black',
                borderRadius: '5px'
              }}
            )
          }
          passCards(cards);
        }
    }
    if($scope.round) {
      cards = [];
      cards.push($scope.cards[index]);
      passCards(cards)
    }

  }

  function passCards(cards) {
    var gamePacket = {
      "request":"play",
      "session_id":session_id,
      "move": {
        "cards": cards
      }
    }
    Service.send(gamePacket);
    cards = []
  }

  $scope.playCard = function(card) {
    var gamePacket = {
      "request":"play",
      "session_id":session_id,
      "move": {
        "card":card
      }
    }
    Service.send(gamePacket);
  }

  // ** Game Functions
  function Pause(message) {
    $scope.players = [];
    $scope.players = message.players
    var playerCount = 0;
    for(var key in $scope.players)
      playerCount++;
    var playersRemaining = 4 - playerCount;
    $scope.game_message = 'Waiting for ' + playersRemaining + ' more players';
  }

  function Deal(message) {
    $scope.dealing = true;
    $scope.cards = [];
    $scope.game_message = 'Dealing ... '
    setTimeout(function deal() {
      $scope.cardStyles = [];
      $scope.dealing = false;
      $scope.game_message = 'Bidding .. ';
      $scope.cards = message.cards;
      $scope.cardStyles = [];
      for(var key in $scope.cards) {
        $scope.cardStyles.push({
          properties: {
            color: 'black',
            backgroundColor: 'white',
            textAlign: 'center',
            fontSize: '10px',
            border: '2px solid black',
            borderRadius: '5px'
          }}
        )
      }
      $scope.$apply();
    }, 3*1000)
  }

  function Bid(message) {
    if(message.currentTurn === 'South')
      $scope.bidding = true;
  }


  function Trump(message) {
    $scope.game_message = 'Selecting Trump ... '
    if(message.currentTurn === 'South')
      $scope.trump = true;
  }

  function Pass(message) {
    $scope.game_message = 'Passing 4 cards .. '
    $scope.cards = message.cards;
    if(message.currentTurn === 'South')
      $scope.passing = true;

    $scope.cardsGrid.dimensions = [$scope.cards.length/2,2]

    $scope.cardStyles = [];
    for(var key in $scope.cards) {
      $scope.cardStyles.push({
        properties: {
          color: 'black',
          backgroundColor: 'white',
          textAlign: 'center',
          fontSize: '10px',
          border: '2px solid black',
          borderRadius: '5px'
        }}
      )
    }
  }

  function Meld(message) {
    $scope.game_message = 'Showing Meld ... '
    $scope.playersMeld = message.playersMeld;
    $scope.team1Score = message.team1Score;
    $scope.team2Score = message.team2Score;
  }

  function Round(message) {
    $scope.game_message = 'Playing Round ... '
    $scope.team1Score = message.team1Score;
    $scope.team2Score = message.team2Score;
    $scope.cards = message.cards;
    $scope.cardsGrid.dimensions = [6,2]
    $scope.cardStyles = [];
    for(var key in $scope.cards) {
      $scope.cardStyles.push({
        properties: {
          color: 'black',
          backgroundColor: 'white',
          textAlign: 'center',
          fontSize: '10px',
          border: '2px solid black',
          borderRadius: '5px'
        }}
      )
    }

    if(message.currentTurn === 'South')
      $scope.round = true;
  }

  function Gameover(message) {
    $scope.game_message = 'Gameover'
  }

  $scope.gameGridOption = {
    properties: {
      textAlign: 'center',
      fontSize: '20px',
      padding: '40px',
      border: '2px solid white'
    }
  }



  $scope.gamePlayGrid = {
    content : '↑',
    properties : {
      color: '#fc5c4f',
      fontSize : '50px',
      textAlign : 'center',
    }
  }

  $scope.scoreBoard = {
    properties : {
      color: 'white',
      backgroundColor: 'blue',
      fontSize : '14px',
      textAlign : 'center'
    }
  }

  $scope.player = {
    properties : {
      color:'yellow',
      fontSize:'20px',
      textAlign:'center'
    }
  }

  $scope.playerMeld = {
    properties : {
      color: 'pink',
      fontSize: '15px',
      textAlign: 'center'
    }
  }

  $scope.currentMessage = {
    properties : {
      color: 'white',
      fontSize: '13px'
    }
  }

  $scope.gameGridTopDown = {
    ratios: [1,2,1],
    direction: 1
  }

  $scope.gameGridMiddleRight = {
    ratios: [1,2,1]
  }

  $scope.gameGridTopRight = {
    ratios: [1,2,1]
  }

  $scope.cardsGrid = {
    dimensions : [6,2]
  }

  $scope.playersGrid = {
    ratios : [1,4],
    direction: 1
  }

  $scope.playersGridDisplay = {
    dimensions : [1,2]
  }

}
