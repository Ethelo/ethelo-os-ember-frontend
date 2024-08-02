export function scopedTranslation (i18n, keys, params) {
  let scopedKey = keys[0];
  let baseKey = scopedKey;

  let scope = keys[1];
  if( !Ember.isNone(scope) ){
    scopedKey = scope + '.' + scopedKey;
  }

  let scope2 = keys[2];
  if( !Ember.isNone(scope2) ){
    baseKey = scopedKey;
    scopedKey = scope2 + '.' + scopedKey;
  }

  let baseDefault = null;
  if (params.defaultIsUnscoped) {

    if(!Ember.isNone(params.default)) {
      baseDefault = params.default;
    }
      params.default = baseKey;
      params.defaultIsUnscoped = null;
  }

  let word = i18n.t(scopedKey, params).toString();
  if (word === scopedKey && !Ember.isNone(baseDefault)){
    params.default = baseDefault;
    word = i18n.t(baseDefault).toString();
  }
  return word;
}

export default Ember.Helper.extend({
  i18n: Ember.inject.service(),

  compute(keys, params) {
    let i18n = this.get('i18n');
    return scopedTranslation(i18n, keys, params);
  }
});

