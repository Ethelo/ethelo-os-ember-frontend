import DS from 'ember-data';
import DetailModelTools from 'frontend/mixins/detail-model-tools';

export default DS.Model.extend( DetailModelTools, {
  title: DS.attr('string'),
  slug: DS.attr('string'),
  visible: DS.attr('boolean'),
  format: DS.attr('string'),
  sort: DS.attr('number', {defaultValue: 0}),
  decision: DS.belongsTo('decision', {
    async: false
  }),
  optionDetailValues: DS.hasMany('option-detail-value', {
    async: false
  }),
  visibleDetailValues: Ember.computed('valueHashes.[]', function(){
    return this.filterVisible(this.get('valueHashes'));
  }),
  valueHashes: Ember.computed('optionDetailValues.[]', function() {
    return this.buildDetailValueHash(this.get('optionDetailValues').toArray());
  }),
  valuesByOptionId: Ember.computed('valueHashes', function() {
    let values = this.get('valueHashes') || [];
    return values.reduce(function(memo, odv) {
      memo[Ember.get(odv, 'option.id')] = odv;
      return memo;
    }, {});
  }),

});


