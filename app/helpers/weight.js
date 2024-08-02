import Formatter from 'frontend/utils/formatters';

export default Ember.Helper.extend({
  i18n: Ember.inject.service(),
  compute([decimal]) {
    let i18n = this.get('i18n');

    return Formatter['percent_with_decimals'](decimal, i18n);
  }
});
