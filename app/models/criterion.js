import DS from 'ember-data';
import CommentTarget from 'frontend/mixins/comment-target';
import Formatter from 'frontend/utils/formatters';

export default DS.Model.extend(CommentTarget, {
  title: DS.attr('string'),
  slug: DS.attr('string'),
  info: DS.attr('string'),
  weighting: DS.attr('number'),
  sort:  DS.attr('number', {defaultValue: 0}),
  decision: DS.belongsTo('decision', {
    async: false
  }),
  resultsLabel: Ember.computed.alias('title'),
  weightingEnabled: DS.attr('boolean', {defaultValue: true}),
  commentType: 'Criterion',
  cssId: Ember.computed('id', function() {
    return Formatter.cssId('criterion-' + this.get('id'));
  }),
});
