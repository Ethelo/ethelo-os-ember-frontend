import DS from 'ember-data';

export default DS.Model.extend({
  decision: DS.belongsTo('decision', {
    async: false
  }),
  user: DS.belongsTo('user', {
    async: false
  }),
  signingPackage: DS.belongsTo('signing-package', {
    async: false
  }),
  binVotes: DS.hasMany('bin-vote', {
    async: false,
  }),
  editLinks: DS.hasMany('edit-links', {
    async: false,
  }),
  criterionWeights: DS.hasMany('criterion-weight', {
    async: false,
  }),
  optionCategoryWeights: DS.hasMany('option-category-weight', {
    async: false,
  }),
  canSeeAdmin: DS.attr('boolean', {defaultValue: false}),
  canComment: DS.attr('boolean', {defaultValue: false}),
  canClientComment: DS.attr('boolean', {defaultValue: false}),
  canModerate: DS.attr('boolean', {defaultValue: false}),
  canSeeAll: DS.attr('boolean', {defaultValue: false}),
  canVote: DS.attr('boolean', {defaultValue: false}),
  canAnswerSurvey: DS.attr('boolean', {defaultValue: false}),
  failedGates: DS.attr('boolean', {defaultValue: false}),
  defaultCommentPrivacy:  DS.attr('boolean', {defaultValue: 'all'}),
});
