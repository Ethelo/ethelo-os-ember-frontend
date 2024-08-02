import DS from 'ember-data';
import CommentTarget from 'frontend/mixins/comment-target';
import Formatter from 'frontend/utils/formatters';

export default DS.Model.extend(CommentTarget, {
  title: DS.attr('string'),
  slug: DS.attr('string'),
  content: DS.attr('string'),
  questionType: DS.attr('string'),
  hideTitle: DS.attr('boolean', {defaultValue: false}),
  showTitle: Ember.computed.not('hideTitle'),
  hasComments: DS.attr('boolean', {defaultValue: false}),
  sort: DS.attr('number', {defaultValue: 0}),
  settings: DS.attr('object'),
  defaultValue: DS.attr('string'),
  defaultAnswerId: DS.attr('number'),
  decision: DS.belongsTo('decision', {
    async: false
  }),
  required: DS.attr('boolean', {defaultValue: false}),
  placeholder: DS.attr('string'),
  otherBoxCaption: DS.attr('string'),
  hasOtherBox: DS.attr('boolean', {defaultValue: false}),
  surveyResponses: DS.hasMany('survey-response', {
    async: false
  }),
  answers: DS.hasMany('question-answer', {
    async: false,
  }),
  responseTotals: DS.hasMany('question-total', {
    async: false,
  }),
  questionCategory: DS.hasMany('question-category', {
    async: false
  }),

  hasAnswers: Ember.computed.gte('answers.length', 1),
  hasResponses: Ember.computed.gte('responseTotals.length', 1),
  hasTotals: Ember.computed.or('isMultipleChoice', 'isSlider'),

  // default type
  isTextInput: Ember.computed(
    'isContentOnly',
    'isTextArea',
    'isRadios',
    'isSelect',
    'isSlider',
    'isLabeledSlider',
    'isUpload',
    'isCheckboxes',
    'isButtons',
    function() {
      return !(
        this.get('isContentOnly') ||
        this.get('isTextArea') ||
        this.get('isUpload') ||
        this.get('isRadios') ||
        this.get('isSlider') ||
        this.get('isLabeledSlider') ||
        this.get('isSelect') ||
        this.get('isButtons') ||
        this.get('isCheckboxes')
      );
    }
  ),
  isContentOnly: Ember.computed.equal('questionType', 'none'),

  isTextArea: Ember.computed.equal('questionType', 'textarea'),
  isDocumentUpload: Ember.computed.equal('questionType', 'pdf_upload'),
  isUpload: Ember.computed.alias('isDocumentUpload'), // support more upload types in futuer

  isButtons: Ember.computed('questionType', 'hasAnswers', function() {
    return this.get('questionType') === 'button' && this.get('hasAnswers');
  }),

  isRadios: Ember.computed('questionType', 'hasAnswers', function() {
    return this.get('questionType') === 'radio' && this.get('hasAnswers');
  }),
  isSelect: Ember.computed('questionType', 'hasAnswers', function() {
    return this.get('questionType') === 'select' && this.get('hasAnswers');
  }),

  isLabeledSlider: Ember.computed('questionType', 'hasAnswers', function() {
    return this.get('questionType') === 'labeled_slider' && this.get('hasAnswers');
  }),
  isSlider: Ember.computed('questionType', function() {
    return this.get('questionType') === 'slider';
  }),

  isCheckboxes: Ember.computed('questionType', 'hasAnswers', function() {
    return this.get('questionType') === 'checkbox' && this.get('hasAnswers');
  }),

  isMultipleChoice: Ember.computed(
    'isCheckboxes', 'isSelect', 'isRadios', 'isButtons', 'isSelect', 'isLabeledSlider',
    function() {
      return this.get('isLabeledSlider') || this.get('isCheckboxes') || this.get('isSelect') ||
        this.get('isButtons') || this.get('isSelect') || this.get('isRadios');
  }),

  componentId: Ember.computed('slug', 'id', function() {
    let slug = this.get('slug');
    if(Ember.isEmpty(slug)) {
      slug = this.get('id');
    }
    return Formatter.cssId('q-' + slug);
  }),

  answerSort: ['position'],

  sortedAnswers: Ember.computed.sort('answers', 'answerSort'),

  commentType: 'Question',

  answerTotals: Ember.computed('responseTotals.@each.updatedAt', function() {
    return this.get('responseTotals')
      .filter(function(total) {
        return total.get('hasAnswer');
      })
      .sort(function(a, b) {
        let aSort = a.get('sort') || a.get('answer.position');
        let bSort = b.get('sort') || b.get('answer.position');
        return aSort > bSort ? 1 : -1;
      });
  }),

  questionTotal: Ember.computed('responseTotals.@each.updatedAt', function() {
    return this.get('responseTotals')
      .filter(function(total) {
        return !total.get('hasAnswer');
      })
      .get('firstObject');
  }),

  numUsersAnswered: Ember.computed('questionTotal.value', function() {
    return this.get('questionTotal.value') || 0;
  }),

  mostPopularTotal: Ember.computed('answerTotals.@each.value', function() {
    return this.get('answerTotals').sortBy('value').pop();
  }),

  answeredBy: function(decisionUser) {
    let responses = this.get('surveyResponses');
    let multiple = this.get('isMultipleChoice');
    let hasOtherBox = this.get('hasOtherBox');

    if(responses.length < 1) {
      return false;
    }

    let filtered = responses.filter(function(response) {
      if(decisionUser && response.get('decisionUser.id') !== decisionUser.id) {
        return false;
      }
      let hasValue = !Em.isEmpty(response.get('value'));

      if(multiple) {
        if(response.get('answers.length') > 0) {
          return true;
        } else if(hasOtherBox) {
          return hasValue;
        } else {
          return false;
        }
      }

      return hasValue;

    });

    return filtered.length > 0;

  }

});
