import bootstrapSlider from 'frontend/components/tool/bootstrap-slider';
import Modals from "frontend/mixins/modals";
export default bootstrapSlider.extend(Modals, {
  classNames: ['survey-labeled-slider'],
  removePrompt: 'voting.prompt.click_remove_answer',
  mobileRemovePrompt: 'voting.prompt.touch_remove_answer',
  previousClass: null,
  selectedButtonStyle: Ember.computed('selectedAnswerId', function() {
    const selectedAnswerId = this.get("selectedAnswerId");
    if(Ember.isEmpty(selectedAnswerId)) {
      return new Ember.String.htmlSafe(`background-color:#757575 ; color: white;`);
    }
    return new Ember.String.htmlSafe("");
  }),

  defaultValue: Ember.computed('question.defaultAnswerIid', function() {
    return this.get('question.defaultAnswerId');
  }),
  questionAnswers: Ember.computed.alias('question.sortedAnswers'),

  displayAnswer: Ember.computed('selectedAnswerId', 'question.defaultAnswerId',
    function() {
      let displayAnswerId = this.get('selectedAnswerId');
      if(Em.isEmpty(displayAnswerId)) {
        displayAnswerId = this.get('question.defaultAnswerId');
      }
      if(Em.isEmpty(displayAnswerId)) {
        return null;
      }
      let answers = this.get('question.answers');
      if(Em.isEmpty(answers)) {
        return null;
      }

      let selected = answers.find(function(answer) {
        return String(displayAnswerId) === String(answer.get('id'));
      });
      return selected;
    }),

  didInsertElement() {
    this.setupSlider();
  },
  setSelectedStyles() {
    this._super(); // ember super call
    this.$('.tooltip-inner').removeAttr('style');
  },
  sliderConfig() {
    let config = this.get('ticks');
    config.formatter = this.get('tooltipFormatter').bind(this);
    config.id = `${this.get('inputId')}-slider`;
    config.value = this.get('sliderValue');
    config.ticks_tooltip = true;
    return config;
  },
  sliderItems: Ember.computed('questionAnswers', function() {
    let answers = this.get('questionAnswers');
    let items = [];

    for(let i = 0; i < answers.length; i++) {

      let answer = answers[i];
      let id = answer.get('id');
      let item = {
        tooltip: answer.get('caption'),
        "formattedValue": id,
        value: parseInt(id),
        id: parseInt(id),
        answer: answer,
        place: i+1
      };
      items.push(item);

    }

    return items;
  }),
  ticks: Ember.computed('questionAnswers', function() {
    let items = Ember.copy(this.get('sliderItems'));
    let settings = {
      ticks: [],
      ticks_labels: [],
      sliderItems: []
    };

    for(let i = 0; i < items.length; i++) {
      let newSliderItem = items[i];
      settings.ticks_labels.push(i);
      settings.ticks.push(i);
      settings.sliderItems.push({...newSliderItem});
    }

    return settings;
  }),
  tooltipFormatter: Ember.computed('sliderItems', function() {
    const items = this.get('sliderItems') || {};

    return function(value, e) {
      return Em.isEmpty(items[value]) ? '' : items[value].tooltip;
    };

  }),
  modalId: Ember.computed('question.id', function(){
    return `${this.get('question.id')}-slider-mobile-modal`;
  }),
  saveValue() {
    let answerId = this.get('sliderItems')[this.get('value')]['id'];
    this.sendAction('valueChanged', answerId);
  },
  promptBeforeSave(){
    return this.promptBeforeSurvey();
  },
  actions: {
    saveModalAnswer(modalAnswer) {
      if (this.promptBeforeSave()){
        return false;
      }
      if(parseInt(this.get('selectedAnswerId')) === modalAnswer.id) {
        this.send('clearValue');
      } else {
        this.sendAction('valueChanged', modalAnswer.id);
      }
      this.closeAllModals();
    }
  }
});
