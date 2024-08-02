export default Ember.Component.extend({
  classNames: 'toggle-switch',

  onLabel: 'On',
  offLabel: 'Off',
  name: 'button',
  id: Ember.computed('name', function() {
    return '#' + this.get('name') + '_switch';
  }),
  checked: Ember.computed('value', function() {
    return this.get('value') === true;
  }),

  didInsertElement() {
    var id = this.get('id');
    var self = this;
    var checkbox = $(id);
    checkbox.bootstrapSwitch({
      state: this.get('checked'),
      size: 'mini',
      onText: '&nbsp;',
      offText: '&nbsp;',
      onColor: 'default',
      onSwitchChange(e) {
        //jshint unused:false
        var value =  $(self.get('id')).bootstrapSwitch('state');
        self.sendAction('toggleSwitch', value);
      }
    });

  },
  actions: {
    toggleOn() {
      $(this.get('id')).bootstrapSwitch('state', true);
    },
    toggleOff() {
      $(this.get('id')).bootstrapSwitch('state', false);
    }

  }
});
