import {scopedTranslation} from 'frontend/helpers/scopet';

export default Ember.Mixin.create({
  i18n: Ember.inject.service(),
  contentFor(key, scope) {
    let i18n = this.get('i18n');
    return scopedTranslation(i18n, [key, scope], {default: ['empty_default']});
  },
  hasContentFor(key, scope) {
    let content = this.contentFor(key, scope);
    if(content === '') {
      return false;
    }
    let stripped = $(`<p>${content}</p>`).text().trim();
    return stripped !== '';
  },

});
