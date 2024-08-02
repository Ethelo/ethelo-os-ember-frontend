import FilteredBreakdown from 'frontend/mixins/filtered-breakdown';
import InfluentTools from 'frontend/mixins/influent-tools';
import DetailTools from 'frontend/mixins/detail-tools';

export default Ember.Component.extend(FilteredBreakdown, DetailTools, InfluentTools, {
  i18n: Ember.inject.service(),

  currentDetailValue: Ember.computed('option.id', 'selectedDetailID', function() {
    this.get('option.id'); //watch
    let visibleDetailValues = this.get("option.visibleDetailValues").toArray();

    let selectedValue = visibleDetailValues.find(x => x.detailId === this.get("selectedDetailID"));
    if(selectedValue) {
      return this.formatValue(selectedValue);
    }
    return "";
  }),

});
