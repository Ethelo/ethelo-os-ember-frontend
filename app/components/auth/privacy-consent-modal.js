import Ember from "ember";
import Registry from "frontend/mixins/registry";
import Modals from "frontend/mixins/modals";
export default Ember.Component.extend(Registry, Modals, {
  authService: Em.inject.service("authentication"),
  consentPanelEnabled: Ember.computed.alias(
    "registry.decision.consentPanelEnabled"
  ),
  analytics: Ember.inject.service(),
  user: Ember.computed.alias("registry.decisionUser.user"),
  actions: {
    agreeTerms() {
      // Save the user terms agree value.
      this.get("authService").submitTerms(this);
    },
  },
  agreeTermsChanged:Ember.observer('user.agreedToTerms',function(){
    this.showConsentPopup();
  }),
  showConsentPopup() {
    // Check if the user has already agreed to terms or not. If not show popup.
    const consentPanelEnabled = this.get("consentPanelEnabled");
    let userAgreedToTerms = this.get("user.agreedToTerms");   // observe
    if (consentPanelEnabled && !Ember.isEmpty(userAgreedToTerms) && !userAgreedToTerms) {
      this.openPrivacyConsentModal();
    }
  },
  didInsertElement() {
    this.showConsentPopup();
  },
});
