import Registry from 'frontend/mixins/registry';

export default Ember.Route.extend(Registry, {
  authService: Em.inject.service('authentication'),

  model(params) {
    this.set('code', params.code);
    return Ember.RSVP.hash({
      decision: this.get('registry.decision'),
      invite: this.get('registry').loadDecisionInvite(params.code) // get mode load
    });
  },

  afterModel: function (model, _) {
    const invite = model.invite || {error: "errors.code.invite_not_found", valid: false};
    this.set('invite', invite);
    const error = invite.get('error');
  },

  setupController(controller, model) {
    controller.set('code', this.get('code'));
    controller.set('invite', this.get('invite'));
    return this._super(controller, model.decision);
  },

});
