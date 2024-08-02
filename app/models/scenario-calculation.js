import DS from 'ember-data';

export default DS.Model.extend({
  i18n: Ember.inject.service(),
  updatedAt: DS.attr('date'),
  format: DS.attr('string'),
  slug: DS.attr('string'),
  title: DS.attr('string'),
  personalResultsTitle: DS.attr('string'),
  value: DS.attr('number'),
  public: DS.attr('boolean', {defaultValue: true}),
  sort:  DS.attr('number', {defaultValue: 0}),
  prLabel: Ember.computed('personalResultsTitle', 'title', function(){
    return this.get('personalResultsTitle') || this.get('title');
  }),
  dataRow: Ember.computed('format', 'value', 'title', 'slug', function(){
    return {
      id: this.get('id'),
      label: this.get('title'),
      title: this.get('title'),
      prLabel: this.get('prLabel') ,
      format: this.get('format'),
      value: this.get('value'),
      visible: !Em.isEmpty(this.get('value')) && this.get('public'),
      showBlank: false,
      slug: this.get('slug'),
      sort: this.get('sort'),
    };
  }),
  scenario: DS.belongsTo('scenario', {
    async: false
  }),
  decision: DS.belongsTo('decision', {
    async: false
  }),

});
