// holds a set of translations for import
import DS from 'ember-data';

export default DS.Model.extend({
  locale: DS.attr('string'),
  translations: DS.attr('object'),
  i18n: Em.inject.service(),

  applyTranslations() {
    const i18n = this.get('i18n');
    if(Em.isEmpty(this.get('translations'))){
      return;
    }
    i18n.addTranslations(this.get('locale'), this.get('translations'));
  }
});
