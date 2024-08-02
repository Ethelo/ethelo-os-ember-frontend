import formatter from 'frontend/utils/formatters';

export function formatValue (i18n, [value], {format, nullDisplay}) {

  if (Ember.isEmpty(value)) {
    return nullDisplay;
  }

  if (!formatter[format]) {
    return value;
  }

  return formatter[format](value, i18n);

}

export default Ember.Helper.extend({
  i18n: Ember.inject.service(),

  compute(keys, params) {
    let i18n = this.get('i18n');
    return formatValue(i18n, keys, params);
  }
});