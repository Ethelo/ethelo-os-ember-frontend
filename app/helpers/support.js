import Formatter from 'frontend/utils/formatters';

export default Ember.Helper.extend({
  i18n: Ember.inject.service(),
  compute([decimal]) {
    if(Ember.isNone(decimal)) {
      return null;
    }

    if(decimal === null) {
      decimal = 0;
    }
    let i18n = this.get('i18n');

    return Formatter['support'](decimal, i18n);
  }
});
