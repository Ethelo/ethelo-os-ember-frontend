import bootstrapSlider from 'frontend/components/tool/bootstrap-slider';

export default bootstrapSlider.extend({
  classNames: ['survey-slider'],
  removePrompt: 'voting.prompt.click_remove_answer',
  mobileRemovePrompt: 'voting.prompt.touch_remove_answer',
  previousClass: null,
  defaultValue: Ember.computed('question.settings.slider-default', function() {
    const defaultValue = this.get('question.settings.slider-default');
    return this.valuePresent(defaultValue) ? defaultValue : null;
  }),
  sliderValue: Ember.computed('value', 'defaultValue', function() {
    let value = this.get('value');
    if(value && typeof value === "string") {
      try {
        value = parseInt(value);
      } catch(error) {
        console.error(`Error converting value: ${value} to string.`, error);
      }
    }
    return this.valuePresent(value) ? value : this.get('defaultValue');
  }),
  setSelectedStyles() {
    this._super();
    this.$('.tooltip').addClass('hide'); // no tooltips for input slider
  },
  setDefaultStyles() {
    this._super();
    this.$('.tooltip').addClass('hide'); // no tooltips for input slider
  },

  min: Ember.computed.alias('question.settings.slider-min'),
  max: Ember.computed.alias('question.settings.slider-max'),
  steps: Ember.computed.alias('question.settings.slider-steps'),

  layoutName: 'components/tool/bootstrap-slider',
  promptBeforeSave(){
    return this.promptBeforeSurvey();
  },
});
