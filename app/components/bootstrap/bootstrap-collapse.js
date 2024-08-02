import Ember from 'ember';

export default Ember.Component.extend({
  showHeader: Ember.computed('title', 'icon', function () {
    let title = this.get('title');
    if (typeof (title) === 'object') {
      title = this.get('title.string');
    }

    return !(Ember.isEmpty(title) && Ember.isEmpty(this.get('icon')));
  }),
  divId: Ember.computed('elementId', 'panelId', function () {
    let panelId = this.get('panelId');
    if (panelId) {
      return panelId;
    } else {
      return this.get('elementId') + 'div';
    }
  }),
  hasVote: Ember.computed('vote', function () {
    /**
     * For likert the value is coming in boolean
     * For Slider the value is coming in integer.
     */
    const voteValue = this.get('vote');
    if (!Ember.isEmpty(voteValue)) {
      if(typeof(voteValue)==='boolean' && !voteValue){
        return false;
      }
      return true
    }
    return false;
  }),
  actions: {
    toggleCollapse(e) {
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
