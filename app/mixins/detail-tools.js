import DetailModelTools from 'frontend/mixins/detail-model-tools';
import TaxTools from 'frontend/mixins/tax-tools';
import Formatter from 'frontend/utils/formatters';

export default Ember.Mixin.create(DetailModelTools, TaxTools, {

  formatItems(items) {
    return items.map((item) => {
      if (Ember.isArray(item.value)) {
        item.value = this.formatItems(item.value);
      } else {
        item.value = this.formatValue(item);
      }
      return item;
    });
  },

  formatValue(item) {
    let value = item.value;

    if (Ember.isEmpty(value) || !Formatter[item.format]) {
      return value;
    }

    if (this.isAdjustableDetail(item.slug)) {
      value = this.residentialToCurrentAssessment(value);
    }

    return Formatter[item.format](value, this.get('i18n'));
  },


  prepareForTable(items){
    let withIds;

    if (Ember.isNone(items)) {
      return [];
    }

    withIds = Ember.copy(items)
      .map(function(item) {
        if (Ember.isNone(item.id)) {
          item.id = 'data-' + (Math.floor(Math.random() * 6));
        }
        return Ember.copy(item);
      });

    return this.formatItems(withIds);
  },


})
;
