/* Vars */

var App = Em.Application.create({
  VERSION: '1.0',
  rootElement: '#app',
  ready: function() {
    console.log(this.get('router'));
  }
});

/* Models */

App.Match = Em.Object.extend({
  games: []
});

App.Match.reopenClass({
  finished: function(match) {
    $.ajax({
      url: '/match/finished',
      data: match.get('id')
    }).fail(function() {
      console.log('That\'s a fail!');
    }).done(function(resp) {

    })
  }
});

App.Game = Em.Object.extend({
  score1: 0,
  score2: 0,
  scoreChanged: function() {
    if (this.get('score1') >= 11 || this.get('score2') >= 11)
    {
      App.Game.save(App.get('router.gameController.game'));
    }
  }.observes('score1', 'score2')
});

App.Game.reopenClass({
  save: function(game) {
    $.ajax({
      url: '/match/game',
      data: game.getProperties('id', 'score1', 'score2')
    }).done(function(resp) {
      console.log('blah')
    });
  }
});

/* Controllers */

App.ApplicationController = Em.Controller.extend();
App.StartController = Em.Controller.extend();
App.GameController = Em.Controller.extend();
App.GameResultController = Em.Controller.extend();
App.ResultsController = Em.Controller.extend();
App.LeadersController = Em.Controller.extend();

/* Views */

App.ApplicationView = Em.View.extend({
  templateName: 'app-tpl'
});
App.StartView = Em.View.extend({
  templateName: 'start-tpl'
});
App.GameView = Em.View.extend({
  templateName: 'game-tpl'
});
App.GameResultView = Em.View.extend({
  templateName: 'game-result-tpl'
});
App.ResultsView = Em.View.extend({
  templateName: 'results-tpl'
});
App.LeadersView = Em.View.extend({
  templateName: 'leaders-tpl'
});

/* Routes */

App.BaseRoute = Em.Route.extend({
  enter: function(router) {
    console.log('Enter route: ' + router.get('currentState.name'));
  },
  exit: function(router) {
    console.log('Exit route: ' + router.get('currentState.name'));
  }
});

App.Router = Em.Router.extend({
  enableLogging: true,
  root: Em.Route.extend({
    index: App.BaseRoute.extend({
      route: '/',
      redirectsTo: 'play'
    }),
    play: App.BaseRoute.extend({
      route: '/play',
      startGame: Em.Route.transitionTo('game'),
      connectOutlets: function(router) {
        console.log(router.get('applicationController'));
        router.get('applicationController').connectOutlet('start');
      }
    }),
    game: App.BaseRoute.extend({
      route: '/game',
      enter: function(router, context) {
        router.get('gameController').set('game', App.Game.create());
        console.log(router.get('gameController').get('game'));
      },
      pointWon: function(router, context) {
        var game = router.get('gameController.game');
        if ($(context.target).is('.score-1'))
        {
          game.incrementProperty('score1');
        }
        else
        {
          game.incrementProperty('score2');
        }
      },
      result: App.BaseRoute.extend({
        route: '/result',
        connectOutlets: function(router) {
          router.get('applicationController').connectOutlet('gameResult');
        }
      }),
      connectOutlets: function(router) {
        router.get('applicationController').connectOutlet('game');
      }
    }),
    results: App.BaseRoute.extend({
      route: '/result/all',
      connectOutlets: function(router) {
        router.get('applicationController').connectOutlet('results');
      }
    }),
    leaders: App.BaseRoute.extend({
      route: '/leaders',
      connectOutlets: function(router) {
        router.get('applicationController').connectOutlet('leaders');
      }
    })
  })
});

App.initialize();
module.exports = App;