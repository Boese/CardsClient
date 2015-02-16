'use strict'
angular.module('cardsApp.GameCtrl', [])
  .controller('GameCtrl', ['$scope','$rootScope','$state','$famous','$interval','Service','$window', '$q', '$timeout',GameCtrl]);

function GameCtrl($scope,$rootScope,$state,$famous,$interval,Service,$window,$q,$timeout) {
  var Transform = $famous['famous/core/Transform'];
  var Modifier = $famous['famous/core/Modifier'];
  var Transitionable = $famous['famous/transitions/Transitionable'];
  var Easing = $famous['famous/transitions/Easing'];
  var SpringTransition = $famous['famous/transitions/SpringTransition'];
  var SnapTransition = $famous['famous/transitions/SnapTransition']
  Transitionable.registerMethod('spring', SpringTransition);
  Transitionable.registerMethod('snap', SnapTransition);

  $scope.height = $window.innerHeight;
  $scope.width = $window.innerWidth;

  // Get Session Id
  var session_id;
  $rootScope.$broadcast('getSession');
  $scope.$on('session')

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
    setPositions(message.players);
  }

  function setPositions(players) {
    $scope.players = [];
    var positionAngle = (2 * Math.PI)/players.length;
    var positionOffset = (($window.innerHeight < $window.innerWidth) ? $window.innerHeight : $window.innerWidth)/2 -50;

    for(var i = 1; i < players.length; i++) {
      $scope.players.push({
        name: players[i].name,
        position: new Transitionable([positionOffset*Math.sin(positionAngle*i),positionOffset*Math.cos(positionAngle*i),0])
      })
    }
  }

  var players = [
    {name:'ME'},
    {name:'Chris'},
    {name:'Chris'},
    {name:'Chris'}
  ]
  setPositions(players)

  var cards = [
    {suit:'clubs',face:'nine'},
    {suit:'clubs',face:'ace'},
    {suit:'diamonds',face:'king'},
    {suit:'diamonds',face:'queen'},
    {suit:'diamonds',face:'queen'},
    {suit:'hearts',face:'nine'},
    {suit:'hearts',face:'ten'},
    {suit:'hearts',face:'jack'},
    {suit:'spades',face:'king'},
    {suit:'spades',face:'ten'},
    {suit:'spades',face:'nine'},
    {suit:'spades',face:'ace'}
    ];

  function Deal(message) {
    $scope.dealing = true;
    $scope.game_message = 'Dealing ... '

    // numCards, dealBy, numPlayers
    cards = message.cards;
    var promise = DealCards(48, 1, 4);
    promise.then(function(result) {
          console.log(result);
      });
  }

  $scope.currentbid = 0;
  $scope.bid = function(bid) {
    if(bid === 'up') {
      $scope.currentbid++;
    } else {
      if($scope.currentbid > 0) {
        $scope.currentbid--;
      }
    }
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

    if($scope.cards.length < 12) {
      $scope.cardsGrid.dimensions = [$scope.cards.length/2,2];
    }

    else {
      $scope.cardsGrid.dimensions = [6,2];
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

    if(message.currentTurn === 'South')
      $scope.round = true;
  }

  function Gameover(message) {
    $scope.game_message = 'Gameover'
  }

  //** CSS Properties **//

  $scope.bidStyle = {
    properties: {
      color: 'white',
      textAlign: 'center',
      backgroundColor: 'red',
      border: '1px solid black',
      borderRadius: '5px'
    }
  }

  $scope.bidCounterStyle = {
    properties: {
      textAlign: 'center',
      color: 'white'
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

  $scope.playerStyle = {
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

  $scope.cardStyle = {
    properties: {
      boxShadow: '1px 1px 1px #888888'
    }
  }

  $scope.playerStyleLayout = {
    direction: 1
  }

  $scope.cardsGrid = {
    dimensions : [6,2]
  }

  $scope.gameBoardLayout = {
    dimensions : [1,3]
  }

  //** Animations **//

  // Deal cards
  function DealCards (cardSize, dealBy, numPlayers) {
    var deferred = $q.defer();

    $scope.deck = [];
    for (var i = 0; i < cardSize; i++) {
      var card = {
        angleZ: new Transitionable([0]),
        position: new Transitionable([i*.3,i*.3,0])
      };
      $scope.deck.push(card);
    }

    var positionCounter = 0;
    var cardsDealt = cardSize;
    var positionAngle = (2 * Math.PI)/numPlayers
    var position = ($window.innerHeight > $window.innerWidth) ? $window.innerHeight : $window.innerWidth;
    $scope.cards = [];

    var deal = function () {
      if(cardsDealt > 0) {

        var angle = (positionCounter * positionAngle) % (Math.PI * 2);
        if(angle >= Math.PI - .001) {
          angle = -((Math.PI * 2) - angle)
        }

        for(var i = 0; i < dealBy; i++) {
          $scope.deck[cardsDealt - 1].angleZ.set([angle], {duration: 300}, function() {
            if(positionCounter % numPlayers === 0) {
              $timeout(function() {
                $scope.cards.push(cards[0]);
                cards.splice(0,1);
              })
            }
          });
          $scope.deck[cardsDealt - 1].position.set([300*i, position + 100*i ,0], {method:'snap', period:200, dampingRatio:20});
          cardsDealt--;
        }
        positionCounter++;

        setTimeout(deal, 300);
      } else {
        deferred.resolve();
      }
    }
    deal();
    return deferred.promise;
  }

  // Load Card Sprite based off face/suit
  $scope.getCardSprite = function(card) {
    if(!card) {
      return;
    }

    var suits = ['diamonds','hearts','clubs','spades'];
    var faces = ['ace','two','three','four','five','six','seven','eight','nine','ten','jack','queen','king'];

    var col = _.indexOf(faces, card.face);
    var row = _.indexOf(suits, card.suit);

    var width = 71;
    var height = 96;

    var background = {
      'background-image':'url(images/cardSpriteSheet.png)',
      'background-position' : parseInt(col*width*-1) + ' ' + parseInt(row*height*-1),
      'width': width,
      'height': height,
      'display': 'block',
      'margin': '0 auto'
    }

    return background;
  }
  DealCards(48,3,4)
}
