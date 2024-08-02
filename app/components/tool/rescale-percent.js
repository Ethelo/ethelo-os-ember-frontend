import InfluentTools from 'frontend/mixins/influent-tools';

export default Ember.Component.extend(InfluentTools, {
  tagName: 'span',
  format: null,
  value: false,
  itemValuePercentage: Ember.computed('value',function() {
    const val = this.get('value');
    if( Ember.isEmpty(val)){
      return '-%';
    } else {
      let rescaledValue = this.rescaleToPercent(val, this.get('format'));

      return `${rescaledValue}%`;

    }

  }),
});
