import DS from 'ember-data';
import CommentTarget from 'frontend/mixins/comment-target';
import DetailModelTools from 'frontend/mixins/detail-model-tools';

export default DS.Model.extend(CommentTarget, DetailModelTools, {
  title: DS.attr('string'),
  slug: DS.attr('string'),
  info: DS.attr('string'),
  sort: DS.attr('number', {defaultValue: 0}),
  decision: DS.belongsTo('decision', {
    async: false
  }),
  resultsTitle: DS.attr('string'),
  resultsLabel: Ember.computed('resultsTitle', 'title', function(){
    let resultsTitle = this.get('resultsTitle');
    return Em.isEmpty(resultsTitle) ? this.get('title') : resultsTitle;
  }),
  // nav settings
  optionDetailValues: DS.hasMany('option-detail-value', {
    async: false,
  }),
  // nav settings
  binVotes: DS.hasMany('bin-vote',{
    async: false,
  }),
  hasBinVotes: Ember.computed('binVotes',function(){
    return this.get('binVotes.length') > 0;
  }),
  optionCategory: DS.belongsTo('option-category', {
    async: false, inverse: 'options',
  }),
  hasVisibleDetails: Ember.computed('visibleDetailValues.[]', function() {
    return this.get('visibleDetailValues').length > 0;
  }),

  visibleDetailValues: Ember.computed('valueHashes.[]', function(){
    return this.filterVisible(this.get('valueHashes'));
  }),
  valueHashes: Ember.computed('optionDetailValues.[]', function() {
    return this.buildDetailValueHash(this.get('optionDetailValues').toArray());
  }),
  commentType: 'Option',

});


