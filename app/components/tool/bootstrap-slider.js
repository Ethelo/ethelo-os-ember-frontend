import Registry from 'frontend/mixins/registry';
import Modals from "frontend/mixins/modals";

export default Ember.Component.extend(Modals, Registry, {
  classNames: ['bootstrap-slider'],
  value: null,
  steps: 0,
  previousValue: null,
  defaultValue: 50, //midpoint
  showDragHint: true,
  removePrompt: 'voting.prompt.click_remove',
  mobileRemovePrompt: 'voting.prompt.touch_remove',
  name: Ember.computed.alias('inputId'),
  inputId: 'bslider',
  valuePresent(value) {
    if(value === 0) {
      return true;
    }
    return !Ember.isEmpty(value);
  },
  hasValue: Ember.computed('value', function() {
    return this.valuePresent(this.get('value'));
  }),
  showRemove: Ember.computed('value', 'canRemoveValue', function() {
    this.get('value'); // watch
    if(!this.get('canRemoveValue')) {
      return false;
    }

    return this.get('hasValue');
  }),
  sliderValue: Ember.computed('value', 'defaultValue', function() {
    let value = this.get('value');
    return this.get('hasValue') ? value : this.get('defaultValue');
  }),
  canRemoveValue: true,
  promptBefore: function(){
    return false;
  },
  onSlideStart(_e) {
     if(this.promptBeforeSave()){
       this.resetSliderToDefault();
       return;
    }
    this.set('previousValue', this.get('value'));
  },
  onSlideStop(e) {
    if(this.promptBeforeSave()){
      this.resetSliderToDefault();
      return;
    }
    let value = e.value;

    if(this.valuePresent(value)) {
      this.set('value', value);
      this.setSelectedStyles();
      this.saveValue();
    } else {
      this.resetSliderToDefault();
    }

  },
  saveValue() {
    this.sendAction('valueChanged', this.get('value'));
  },
  resetSliderToDefault() {
    if (this.promptBeforeSave() ){
      return false;
    }
    this.set('value', null);
    this.saveValue();

    this.setDefaultStyles();
  },
  setDefaultStyles() {

    this.$('.slider-handle').removeClass('primary-accent-bg');
    this.$('.tooltip-inner').removeClass('primary-accent-bg');
    this.$().addClass('default-value');

    this.$('.slider-selection').addClass('default-value-selection');
    this.$('.slider-handle').addClass('default-value-handle');
    this.$('.tooltip-main').addClass("tooltip-main-default");

   },
  setSelectedStyles() {
    this.$().removeClass('default-value');
    this.$('.slider-selection').removeClass('default-value-selection');
    this.$('.slider-handle').removeClass('default-value-handle');
    this.$('.tooltip-main').removeClass("tooltip-main-default");

    this.$('.slider-handle').addClass('primary-accent-bg');
    this.$('.tooltip-inner').addClass('primary-accent-bg');

  },
  tooltip() {
    return 'hide';
  },
  sliderConfig() {
    let config = {
      id: `${this.get('inputId')}-slider`,
      min: Ember.isNone(this.get('min')) ? 1 : this.get('min'),
      max: this.get('max') ? this.get('max') : 100,
      value: Math.ceil(this.get('sliderValue')),
      tooltip: this.get('tooltip'),
    };

    let steps = this.get('steps');

    if(steps > 0) {
      config.step = steps;
    }

    return config;
  },
  setupSlider() {
    const config = this.sliderConfig();

    const slider = this.$('#' + this.get('inputId')).slider(config);

    slider.on('slideStart', this.onSlideStart.bind(this));
    slider.on('slideStop', this.onSlideStop.bind(this));

    this.setDefaultStyles();

    if(this.valuePresent(this.get('value'))) {
      this.setSelectedStyles();
    }
  },

  updateSlider: Ember.observer('inputId', function() {
    this.get('inputId'); // watch
    Ember.run.scheduleOnce('afterRender', this, function() {
      this.destroySlider();
      this.setupSlider();
    });
  }),
  willDestroyElement() {
    this.destroySlider();
  },
  didInsertElement() {
    this.setupSlider();
  },
  didRender() {
    this.destroySlider();
    this.setupSlider();
  },
  destroySlider() {
    this.$('#' + this.get('inputId')).slider().slider('destroy');
  },
  refreshSlider(){
    this.$('#' + this.get('inputId')).slider().slider('refresh',{ useCurrentValue: true });
  },
  actions: {
    clearValue() {
      this.resetSliderToDefault();
    },
    clearValuesOnKeyDown(e){
      // Only allow Enter/Spacebar key in accessibility to change values
      if(e && 'keyCode' in e &&  e.keyCode === 13 || e.keyCode === 32) {
        this.resetSliderToDefault();
        e.preventDefault();
      }
    }
  }
});
