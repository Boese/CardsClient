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

  // Moving card
  var x = 0;
  var y = 0;
  $scope.cardTouchStart = function(event,card) {
    x = event.changedTouches[0].clientX - card.position.state[0];
    y = event.changedTouches[0].clientY - card.position.state[1];
  }

  $scope.cardTouchMove = function(event,card) {
    var deltaX = event.changedTouches[0].clientX - x;
    var deltaY = event.changedTouches[0].clientY - y;
    card.position.set([deltaX,deltaY,0])
  }

  $scope.cardTouchEnd = function(event,card) {
    var middleY = $scope.height/5

    var destY = (Math.abs(card.position.state[1]) <= middleY/2) ? 0 : middleY;

    if(destY === 0)
      card.position.set([0,0,0]);
    else {
      card.position.set([0,-middleY,0]);
    }
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

  function passCards() {
    var gamePacket = {
      "request":"play",
      "session_id":session_id,
      "move": {
        "cards": passCards
      }
    }
    Service.send(gamePacket);
    passCards = []
  }

  function playCard(card) {
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
    var positionOffset = (($scope.height < $scope.width) ? $scope.height : $scope.width)/2 -50;

    for(var i = 1; i < players.length; i++) {
      $scope.players.push({
        name: players[i].name,
        position: new Transitionable([positionOffset*Math.sin(positionAngle*i),positionOffset*Math.cos(positionAngle*i),0])
      })
    }
  }

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

  $scope.optionStyle = {
    properties: {
      color: 'white',
      textAlign: 'center',
      backgroundColor: 'blue',
      fontSize : '30px',
      padding: '10px',
      border: '2px solid black',
      borderRadius: '20px'
    }
  }

  $scope.bidCounterStyle = {
    properties: {
      textAlign: 'center',
      color: 'white'
    }
  }

  $scope.scoreboardStyle = {
    content : 'Scoreboard',
    properties : {
      color: 'white',
      backgroundColor: 'black',
      fontSize : '30px',
      textAlign : 'center',
      borderRadius: '20px',
      boxShadow: '10px 10px 20px 10px white'
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
  function DealCards (cardSize, dealBy) {
    var deferred = $q.defer();
    var numPlayers = players.length

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
    var position = ($scope.height > $scope.width) ? $scope.height : $scope.width;
    var playerDeal = false;
    var time = 150;
    $scope.cards = [];

    var deal = function () {
      if(cardsDealt > 0) {

        var angle = (positionCounter * positionAngle) % (Math.PI * 2);
        if(angle >= Math.PI - .001) {
          angle = -((Math.PI * 2) - angle)
        }

        if(positionCounter % numPlayers === 0) {
          playerDeal = true;
        } else {
          playerDeal = false;
        }
        for(var i = 0; i < dealBy; i++) {
          $scope.deck[cardsDealt - 1].angleZ.set([angle], {duration: time}, function() {
            if(playerDeal) {
              $timeout(function() {
                  $scope.cards.push(cards[0]);
                  $scope.cards[$scope.cards.length - 1].position = new Transitionable([0,0,0]);
                  cards.splice(0,1);
                  $scope.cardsGrid.dimensions = [($scope.cards.length < 6) ? 6 : Math.ceil($scope.cards.length/2),2];
              })
            }
          });
          $scope.deck[cardsDealt - 1].position.set([300*i, position + 100*i ,0], {method:'snap', period:time, dampingRatio:20});
          cardsDealt--;
        }
        positionCounter++;

        setTimeout(deal, 2*time + 10);
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

  $scope.option = false;
  $scope.options = [
    {option: 'Hearts'},
    {option: 'Spades'},
    {option: 'Clubs'}
  ]

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
    {suit:'spades',face:'ace'},
    {suit:'spades',face:'king'},
    {suit:'spades',face:'ten'},
    {suit:'spades',face:'nine'},
    {suit:'spades',face:'ace'}
    ];

    var players = [
      {name:'ME'},
      {name:'Henry'},
      {name:'Joe'},
      {name:'Roger'},
      {name:'ME'},
      {name:'Henry'},
      {name:'Joe'},
      {name:'Roger'}
    ]

  $scope.setPlayers = function() {
    setPositions(players);
  }

  $scope.startDeal = function() {
    // # of cards, # to dealBy
    DealCards(48,1);
  }

  $scope.startBidding = function() {
    $scope.bidding = !($scope.bidding);
  }

  $scope.startOption = function() {
    $scope.option = !($scope.option);
  }
}
