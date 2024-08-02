import Registry from 'frontend/mixins/registry';
import Modals from "frontend/mixins/modals";
export default Ember.Component.extend(Registry, Modals, {
  menu: Ember.inject.service(),

  actions: {
    openAuthModal() {
      this.openAuthModal();
	},
  }
});
