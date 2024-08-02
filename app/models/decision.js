import DS from 'ember-data';
import CommentTarget from 'frontend/mixins/comment-target';

export default DS.Model.extend(CommentTarget, {
  decisionUser: DS.belongsTo('decision-user', {
    async: false
  }),
  theme: DS.belongsTo('theme', {
    async: false
  }),
  taxAssessment: DS.belongsTo('tax-assessment', {
    async: false
  }),
  pages: DS.hasMany('page', {
    async: false
  }),
  optionCategories: DS.hasMany('option-category', {
    async: false
  }),
  criteria: DS.hasMany('criterion', {
    async: false
  }),
  options: DS.hasMany('option', {
    async: false
  }),
  title: DS.attr('string'),
  summary: DS.attr('string'),
  subdomain: DS.attr('string'),
  fullDomain: DS.attr('string'),
  hasInviteCodes: DS.attr('boolean'),
  requiresInvite: Ember.computed.alias('hasInviteCodes'),
  allowsGuests: DS.attr('boolean'),
  allowsSignup: DS.attr('boolean'),
  web3Gates: DS.attr('boolean'),
  web3Mode: DS.attr('string', {defaultValue: 'none'}),
  web3SignatureRequired: DS.attr('boolean', {defaultValue: false}),
  commentsVisibility: DS.attr('string', {defaultValue: 'all'}),
  commentsPermissions: DS.attr('string', {defaultValue: 'all'}),
  commentsTargets: DS.attr('array'),
  commentsPerPreview: DS.attr('number', {defaultValue: 2}),
  commentsPerPage: DS.attr('number', {defaultValue: 10}),
  commentsMaxLength: DS.attr('number', {defaultValue: 500}),
  commentsTitlesEnabled: DS.attr('boolean', {defaultValue: false}), // not used
  votePermissions: DS.attr('string', {defaultValue: 'all'}),
  surveyPermissions: DS.attr('string', {defaultValue: 'all'}),
  optionVoteBins: DS.attr('number', {defaultValue: 5}),
  resultMode: DS.attr('string', {defaultValue: 'canvass'}),
  supportOnly: DS.attr('boolean', {defaultValue: false}),
  sidebars: DS.attr('object'),
  loadRankedScenarios: Ember.computed.equal('resultMode', 'combination'), // will be more complex in future
  startDate: DS.attr('date'),
  endDate: DS.attr('date'),
  consentPanelEnabled : DS.attr('boolean'),
  commentType: 'Results',
  demoVoting: Ember.computed.equal('votePermissions', 'demo'),
  demoComments: Ember.computed.equal('commentsPermissions', 'demo'),
  demoSurvey: Ember.computed.equal('surveyPermissions', 'demo'),
  authenticatedVoting: Ember.computed.equal('votePermissions', 'authenticated'),
  authenticatedComments: Ember.computed.equal('commentsPermissions', 'authenticated'),
  authenticatedSurvey: Ember.computed.equal('surveyPermissions', 'authenticated'),

  publicComments: Ember.computed.equal('commentsVisibility', 'all'),
  sandboxedComments: Ember.computed.equal('commentsVisibility', 'approved'),
  adminOnlyComments: Ember.computed.equal('commentsVisibility', 'admin'),

});
