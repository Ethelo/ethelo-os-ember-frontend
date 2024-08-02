import Modals from "frontend/mixins/modals";

export default Ember.Component.extend(Modals, {
  tagName: 'label',

  init() {
    // interpret empty strings as empty arrays
    let arrayValue = this.get('arrayValue');
    if (!arrayValue || arrayValue === '') {
      this.set('arrayValue', []);
    }

    this._super();
  },

  isBB() {
    let ua = navigator.userAgent;
    return (ua.indexOf("BlackBerry") >= 0 || ua.indexOf("BB10") >= 0 );
  },

  didInsertElement() {
    // HACK HACK HACK Bootstrap-material fails to correctly interpolate <span> elements on BB like it does on other browsers
    // Which are used instead of the bare <input> under Material-Bootstrap to communicate visually with the user.
    // To support BB, we reset the style of the basic <input> element to show it again, in lieu of the missing <span>s.
    // There are so many things wrong with doing a browser detect and then a style reset I don't know where to begin
    // OTOH wherever that place is, it's better than debugging the Material-Bootstrap javascript under BB
    if (this.isBB()) {
      let cb = this.$("input[type='checkbox']");
      cb.addClass("reset-this");
      //visual fix for BB
      cb.attr('style',"position: relative !important; top: 3px !important;");
    }

    // Add the CSS to the label tag to display the text next to the checkbox
    this.$("input[type='checkbox']").parent("label").css("display","inline-flex");
  },

  checked: Ember.computed('arrayValue', function() {
    let value = this.get('value');
    let arrayValue = this.get('arrayValue');
    if (!arrayValue) {
      return false;
    }
    arrayValue = Em.makeArray(arrayValue);

    let checked = arrayValue.any(function(val) {
      return val === value;
    });
    return checked;

  }),

  change() {
    if(this.promptBeforeSurvey()) {
      return;
    }
    let value = this.get('value');
    let arrayValue = this.get('arrayValue');

    arrayValue = Em.makeArray(arrayValue);

    let existingIndex = arrayValue.indexOf(value);
    if (existingIndex >= 0) {
      arrayValue.splice(existingIndex, 1);
    } else {
      arrayValue.push(value);
    }

    this.set('arrayValue', null);
    this.set('arrayValue', arrayValue);
    this.sendAction('select', arrayValue);
    return false;
  }
});
