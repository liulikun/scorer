/* Vars */

App = Em.Application.create({
  VERSION: '1.0',
  rootElement: '#app'
});

/* Models */

App.Player = Em.Object.extend();
App.Player.reopenClass({
  allPlayers: [],
  findComplete: function(resp){
    resp.forEach(function(player){
      this.allPlayers.addObject(App.Player.create(player));
    }, this);
  },
  find: function() {
    this.allPlayers = [];
    $.ajax({
      url: '/players.json',
      context: this
    }).done(this.findComplete);
    return this.allPlayers;
  }
});

App.Team = Em.Object.extend({
  players: []
});

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
  match_id: 1,
  score1: 0,
  score2: 0,
  maxScore: 11,
  finished: function() {
    return (this.get('score1') === this.get('maxScore') ||
      this.get('score2') === this.get('maxScore'));
  }.property('score1',
    'score2',
    'maxScore'),
  scoreChanged: function() {
    if (this.get('finished') === true)
    {
      App.Game.save(App.get('router.gameController.game'));
    }
  }.observes('score1',
    'score2')
});

App.Game.reopenClass({
  save: function(game) {
    $.ajax({
      url: '/games.json',
      type: "POST",
      beforeSend: function(xhr) {xhr.setRequestHeader('X-CSRF-Token', $('meta[name="csrf-token"]').attr('content'))},
      data: {game: game.getProperties('match_id', 'score1', 'score2')}
    }).done(function(resp) {
      console.log(resp);
      // TODO: Our game was saved so now we need to generate a new game...
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
App.MessageController = Em.Controller.extend();

/* Views */

App.ApplicationView = Em.View.extend({
  templateName: 'app-tpl',
  classNames: ['app-view'],
  classNameBindings: ['controller.playingGame:playing'],
  playingGame: false,
  eventManager: Em.Object.create({
    finishMatch: function(evt, view) {
      console.log('Yay!');
    }
  })
});
App.ATeamView = Em.View.extend({
  templateName: 'select-team-tpl',
  players: [App.Player.create({handle:'svizzari'}), App.Player.create({handle:'jswsj'}), App.Player.create({handle:'thebean'})]
});
App.TeamsView = Em.CollectionView.extend({
  content: [ App.Team.create(), App.Team.create()]/*,
  itemViewClass: App.ATeamView.extend()*/
});
App.StartView = Em.ContainerView.extend({
  childViews: ['teamsView', 'actionView'],
  teamsView: Em.View.extend({
    template: Em.Handlebars.compile('<div class="row start-game">{{collection App.TeamsView itemViewClass="App.ATeamView"}}</div>')
  }),
  actionView: Em.View.extend({
    layout: Em.Handlebars.compile('<div class="row"><div class="span12">{{yield}}</div></div>'),
    template: Em.Handlebars.compile('<a {{action startGame}} class="btn btn-large">Lets play! <i class="icon-chevron-right"></i></a>')
  })
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
App.MessageView = Em.View.extend({
  templateName: 'message-tpl'
});

/* Routes */

App.BaseRoute = Em.Route.extend({
  enter: function(router) {
    /*router.get('applicationController')
      .set('playingGame', false);*/
  },
  exit: function(router) {
    //console.log('Exit route: ' + router.get('currentState.name'));
  }
});

App.Router = Em.Router.extend({
  enableLogging: true,
  root: App.BaseRoute.extend({
    index: App.BaseRoute.extend({
      route: '/',
      redirectsTo: 'play'
    }),
    play: App.BaseRoute.extend({
      route: '/play',
      startGame: Em.Route.transitionTo('game'),
      connectOutlets: function(router) {
        console.log(router.get('applicationController'));
        router.get('applicationController')
          .connectOutlet('start');
      }
    }),
    game: App.BaseRoute.extend({
      route: '/game',
      enter: function(router, context) {
        router.get('gameController')
          .set('game', App.Game.create());
        router.get('applicationController')
          .set('playingGame', true);
      },
      finishMatch: function(router, context) {
        console.log('hi');
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
      connectOutlets: function(router) {
        router.get('applicationController')
          .connectOutlet('game');
      }
    }),
    results: App.BaseRoute.extend({
      route: '/result/all',
      connectOutlets: function(router) {
        router.get('applicationController')
          .connectOutlet('results');
      }
    }),
    leaders: App.BaseRoute.extend({
      route: '/leaders',
      connectOutlets: function(router) {
        router.get('applicationController')
          .connectOutlet('leaders');
      }
    })
  })
});

App.initialize();

//console.log(App.router)

//module.exports = App;
//module.exports = App;
