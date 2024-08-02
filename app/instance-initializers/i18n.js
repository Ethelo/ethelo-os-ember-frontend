import spanish from 'frontend/locales/es/momentDictionary';
import canFrench from 'frontend/locales/fr-ca/momentDictionary';
import mongolian from 'frontend/locales/mn/momentDictionary';
import vietnamese from 'frontend/locales/vi/momentDictionary';
import russian from 'frontend/locales/ru/momentDictionary';
import simplifiedChinese from 'frontend/locales/zh-cn/momentDictionary';


export default {
  name: 'i18n',
  initialize: function({ container }) {
    var options = container.lookup('session:env');
    container.lookup('service:i18n').set('locale', options['locale'] || 'en' );
    if (options['locale'] === 'es') {
      moment.locale(options['locale'], spanish);
    }
    if (options['locale'] === 'fr-ca') {
      moment.locale(options['locale'], canFrench);
    }
    if (options['locale'] === 'mn') {
      moment.locale(options['locale'], mongolian);
    }
    if (options['locale'] === 'ru') {
      moment.locale(options['locale'], russian);
    }
    if (options['locale'] === 'vi') {
      moment.locale(options['locale'], vietnamese);
    }
    if (options['locale'] === 'zh-cn') {
      moment.locale(options['locale'], simplifiedChinese);
    }

  }
};

