import InfluentTools from 'frontend/mixins/influent-tools';

export default Ember.Component.extend(InfluentTools, {
  tagName: 'tr',
  item: null,

  percentageValue: Ember.computed('item.rawValue', 'item.blankValue', function() {
    const value = this.get('item.rawValue');

    if (Ember.isEmpty(value)) {
      return this.get('item.blankValue');
    } else {
      let rescaledValue = this.rescaleToPercent(value, this.get('item.format'));
      return `${rescaledValue}%`;
    }
  }),
});
