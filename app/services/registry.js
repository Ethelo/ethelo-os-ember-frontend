import DS from 'ember-data';

DS.PromiseObject = Ember.ObjectProxy.extend(Ember.PromiseProxyMixin);

export default Ember.Service.extend({
  isServiceFactory: true, // should not be needed?
  authService: Em.inject.service('authentication'),
  store: Ember.inject.service(),
  lastDecisionLoad: null,
  isPreview: Ember.computed.alias('session.preview'),
  loadCommentSummary() {
    Ember.run.throttle(this, '_loadCommentSummary', 1000 * 10);  // milliseconds
  },
  _loadCommentSummary() {
    let that = this;
    this.get('store').findAll('comment-summary').then(this.loadCommentSummary.bind(this));
  },
  addDefaultHandlers(promise, caption) {
    return promise
      .then(this.returnModel, this.emptyFunc, caption)
      .catch(this.catchFunc);
  },
  returnModel(model) { // we use when we want to add a nonfunctional then for logging
    return model;
  },
  emptyFunc() { // we use when we want to add a nonfunctional then for logging
  },
  catchFunc(e) {
    console.log(e);
  }, // handle errors
  loadDecisionInvite(code) {
    let promise = this.get('store').findRecord('invite', code);
    return this.addDefaultHandlers(promise, 'invite');
  },
  loadBaseTranslations() {
    if(this.get('decisionBaseRSVP.isFulfilled')) {
      // skip second load
      return this.get('store').peekAll('translation-locale');

    } else {
      let promise = this.get('store').findAll('translation-locale');
      return this.addDefaultHandlers(promise, 'translation-locale-all');
    }
  },
  loadDecisionTranslations() {
    let promise = this.get('store').findRecord('translation-locale', 'decision');
    return this.addDefaultHandlers(promise, 'translation-locale-decision');
  },
  loadWithTranslations(promise) {

    let rvspPromise = Ember.RSVP.hash({
      decision: promise,
      decision_translation: this.loadDecisionTranslations(),
      translations: this.loadBaseTranslations()
    })

      .then(function() {
        this.set('lastDecisionLoad', Date.now()); // for observers

        let locales = this.get('store').peekAll('translation-locale');
        locales = locales.sortBy('id'); // decision translation last
        locales.forEach(function(locale) {
          locale.applyTranslations();
        });
        return locales;
      }.bind(this), 'rsvp hash translations');

    return DS.PromiseObject.create({
      promise: this.addDefaultHandlers(rvspPromise, 'load-with-translations')
    });
  },

  decisionWithUserPromise(force = false) {
    if(force) {
      this.get('store').unloadAll('decision-session');
    } // prevents cache being used

    let promise = this.get('store').findRecord('decision-session', 0)
      .then(function(decisionSession) {

        // ensure these values are always up to date
        let data = {
          userId: decisionSession.get('decisionUser.user.id'),
          decisionUserId: decisionSession.get('decisionUser.id')
        };

        this.get('authService').updateUser(data, false);
      }.bind(this));

    return this.addDefaultHandlers(promise, 'decision-session');

  },

  canLoadDecision() {
    return this.get('session.decisionId');
  },
  canBeginDecisionWithUser() {
    return this.canLoadDecision() && this.get('session.decisionUserId') && !this.get('decisionWithUserRSVP');
  },
  decisionBasePromise(force = false) {
    if(force) {
      this.get('store').unloadAll('base'); // prevents cache being used
    }
    let promise = this.get('store').findRecord('base', 0);  // id doesnt matter, isn't used
    return this.addDefaultHandlers(promise, 'base');
  },
  canBeginDecisionBase() {
    return this.canLoadDecision() && !this.get('decisionBaseRSVP');
  },
  reloadDecision() {
    this.set('decisionBaseRSVP', null);
    this.set('decisionWithUserRSVP', null);
    return this.loadDecision(true);
  },
  loadDecision(force = false) {
    if(this.canBeginDecisionWithUser()) {

      let promise = this.decisionWithUserPromise(force);
      let hash_promise = this.loadWithTranslations(promise);
      this.set('decisionWithUserRSVP', hash_promise);
      return hash_promise;

    } else if(this.get('decisionWithUserRSVP')) {

      return this.get('decisionWithUserRSVP');

    } else if(this.canBeginDecisionBase()) {

      let promise = this.decisionBasePromise(force);
      let hash_promise = this.loadWithTranslations(promise);
      this.set('decisionBaseRSVP', hash_promise);
      return hash_promise;

    } else if(this.get('decisionBaseRSVP')) {

      return this.get('decisionBaseRSVP');

    } else {
      return this.get('store').peekRecord('decision-user', this.get('session.decisionUserId'));
    }
  },

  decision: Ember.computed(
    'session.decisionId', 'session.decisionUserId', 'decisionBaseRSVP.isFulfilled', 'decisionWithUserRSVP.isFulfilled',
    function() {
      this.get('session.decisionUserId');
      this.get('decisionBaseRSVP.isFulfilled');
      this.get('decisionWithUserRSVP.isFulfilled'); //observe

      return this.get('store').peekRecord('decision', this.get('session.decisionId'));

    }),
  decisionUser: Ember.computed('session.decisionUserId', 'decisionWithUserRSVP.isFulfilled', function() {
    this.get('decisionWithUserRSVP.isFulfilled'); //observe
    return this.get('store').peekRecord('decision-user', this.get('session.decisionUserId'));
  }),

  user: Ember.computed('session.userId', 'session.decisionUserId', 'decisionWithUserRSVP.isFulfilled', function() {
    this.get('session.decisionUserId');
    this.get('decisionWithUserRSVP.isFulfilled'); //observe
    return this.get('store').peekRecord('user', this.get('session.userId'));
  }),
  scenarios: Ember.computed(function() {
    return this.get('store').peekAll('scenario');
  }),
  scenarioCount: Ember.computed('scenarioMeta.count', function() {
    let count = this.get('scenarioMeta.count');
    return Ember.isEmpty(count) ? 1 : count;
  }),
  userScenarioCount: Ember.computed('userScenarioMeta.count', function() {
    let count = this.get('userScenarioMeta.count');
    return Ember.isEmpty(count) ? 1 : count;
  }),
  scenarioSolveStatus: Ember.computed('scenarioMeta.status', function() {
    return this.get('scenarioMeta.status');
  }),
  userScenarioSolveStatus: Ember.computed('userScenarioMeta.status', function() {
    return this.get('userScenarioMeta.status');
  }),
  userScenarioWaiting: false,
  userScenarioQuery(rank = 1, withGlobal = true) {
    let registry = this;
    registry.set('userScenarioWaiting', true);
    let promise = this.get('store')
      .query('scenario', {rank: rank, with_global: withGlobal, for_user: true})
      .then((results) => {
        if(!registry.isDestroyed) {
          if(results.get('meta.status') === 'pending') {
            registry.delayedReloadUserScenario();
          }

          console.log("pr meta", results.get('meta'));
          registry.set('userScenarioWaiting', false);
          registry.set('userScenarioMeta', results.get('meta'));
        }
      })
      .catch((e) => {
        registry.set('userScenarioWaiting', false);
        registry.catchFunc(e);
      });
    return this.addDefaultHandlers(promise, 'user-scenario');

  },
  groupScenarioQuery(rank = 1, withGlobal = true) {
    let registry = this;
    let promise = this.get('store')
      .query('scenario', {rank: rank, with_global: withGlobal, for_user: false})
      .then((results) => {
        if(!registry.isDestroyed) {
          if(results.get('meta.status') === 'pending') {
            registry.delayedReloadGroupScenario();
          }
          console.log("g meta", results.get('meta'));

          registry.set('scenarioMeta', results.get('meta'));
        }
      });
    return this.addDefaultHandlers(promise, 'group-scenario');

  },
  delayedReloadUserScenario() {
    let loadFunc = function() {
      this.loadScenarios(1, true, true);
    }.bind(this);

    if(this.get('userScenarioWaiting')) {
      Ember.run.later(this.delayedReloadUserScenario.bind(this), 1000); // 1 sec
    } else {
      Ember.run.later(loadFunc, 1000); // 1 sec
    }

  },
   delayedReloadGroupScenario() {
    let loadFunc = function() {
      this.loadScenarios(1, true, false);
    }.bind(this);

    Ember.run.later(loadFunc, 1000); // 1 sec
  },
  rankFunctions: {},
  globalRankLoadFunction(rank, withGlobal) {
    let functions = this.get('rankFunctions');
    if(Em.isEmpty(functions[rank])) {
      functions[rank] = function() {
        this.groupScenarioQuery(rank, withGlobal);
      }.bind(this);
    }
    return functions[rank];
  },
  preloadUserScenario() {

    let needsPreload = this.get('store').peekAll('page').any(function(page) {
      return page.get('hasParticipantResultsSidebar');
    });

    if(needsPreload) {
      this.delayedReloadUserScenario();
    }

  },
  preloadGroupScenario() {

    let needsPreload = this.get('store').peekAll('page').any(function(page) {
      return page.get('template') === 'results-group';
    });

    if(needsPreload) {
      this.loadScenarios(1, true, false);
    }

  },

  loadScenarios(rank = 1, withGlobal = true, forUser = false) {
    if(forUser) {
      Ember.run.throttle(this, this.userScenarioQuery, rank, withGlobal, this.get('userScenarioThrottle'));
    } else {
      rank = parseInt(rank);
      Ember.run.throttle(this, this.globalRankLoadFunction(rank, withGlobal), this.get('groupScenarioThrottle'), true);
      Ember.run.throttle(this, this.globalRankLoadFunction(rank + 1, false), this.get('groupScenarioThrottle'), true);
      if(rank > 1) {
        Ember.run.throttle(this, this.globalRankLoadFunction(rank - 1, false), this.get('groupScenarioThrottle'), true);
      }
    }
  },
  userScenarioThrottle: 1000,
  groupScenarioThrottle: 5000,
  preloadSigningPackage() {
    if(this.get('decision.web3SignatureRequired')) {
      this.delayedReloadSigningPackage();
    }
  },
  signingPackageWaiting: false,
  loadSigningPackage() {
    // empty query is the easist way to load this

    let registry = this;
    registry.set('signingPackageWaiting', true);
    let promise = this.get('store')
      .query('signing-package', {})
      .then(() => {
        if(!registry.isDestroyed) {
          registry.set('signingPackageWaiting', false);
        }
      })
      .catch((e) => {
        registry.set('signingPackageWaiting', false);
        registry.catchFunc(e);
      });
    return this.addDefaultHandlers(promise, 'signing package');

  },
  delayedReloadSigningPackage() {
    let loadFunc = function() {
      this.loadSigningPackage();
    }.bind(this);

    if(this.get('signingPackageWaiting')) {
      Ember.run.later(this.delayedReloadSigningPackage.bind(this), 500); // 1 sec
    } else {
      Ember.run.later(loadFunc, 1000); // 1 sec
    }
  },
})
;
