import $ from "jquery";

export default Ember.Mixin.create({
  actions: {
    toggleCollapseMenu(e) {
      // Only allow Enter/Spacebar key in accessibility to open/close the dropdown
      if(e && 'keyCode' in e && e.keyCode === 13 || e.keyCode === 32) {
        let trigger = e.target;
        let target = $(trigger).data('target');

        $(target).collapse('toggle');
        e.preventDefault();
      }
    },
  }
});
