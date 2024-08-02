import Registry from 'frontend/mixins/registry';
import {translationMacro as t} from "ember-i18n";

export default Ember.Controller.extend(Registry, {
  redirectMessage: t("errors.expiry"),
  errorTitle: Ember.computed('statusText', function() {
    return this.get('statusText');
  }),

  errorMessage: Ember.computed('status', 'responseText', function() {
    if (this.get('status') === 401) {
      return this.get("redirectMessage").toString();
    }

    return this.get('responseText');
  })

});
