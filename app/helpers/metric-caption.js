import Ember from 'ember';
import InfuentTools from 'frontend/mixins/influent-tools';

export default Ember.Helper.extend(InfuentTools, {
  i18n: Ember.inject.service(),

  compute([value, format]) {

    if (Ember.isNone(value)) {
      return '';
    }

    value = parseFloat(value);

    let binNumber = this.rescaleToBin(value, format);

    let caption = this.captionKeyForBin(binNumber, format, true);

    return this.get('i18n').t(caption);
  }
});
