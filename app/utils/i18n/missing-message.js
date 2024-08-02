// FILE AT app/utils/i18n/missing-message.js
//
// NOTE if ember-i18n add support for fallback locales we won't need this
// https://github.com/jamesarosen/ember-i18n/issues/256

let missingMessage = function(locale, key) {
  if (Ember.isNone(key)){
    return 'undefined';
  }
  Ember.Logger.warn("Missing translation: " + key);
  return key;
};

export default missingMessage;