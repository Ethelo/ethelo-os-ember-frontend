import CommentTarget from 'frontend/mixins/comment-target';
import DS from 'ember-data';
import Formatter from 'frontend/utils/formatters';

export default DS.Model.extend(CommentTarget, {
  title: DS.attr('string'),
  slug: DS.attr('string'),
  info: DS.attr('string'),
  weighting: DS.attr('number', {defaultValue: 50}),
  flatFee: DS.attr('number', {defaultValue: null}),
  budgetPercent: DS.attr('number', {defaultValue: null}),
  resultsTitle: DS.attr('string'),
  resultsLabel: Ember.computed('resultsTitle', 'title', function() {
    let resultsTitle = this.get('resultsTitle');
    return Em.isEmpty(resultsTitle) ? this.get('title') : resultsTitle;
  }),

  sort: DS.attr('number', {defaultValue: 0}),
  decision: DS.belongsTo('decision', {
    async: false
  }),
  weightingEnabled: DS.attr('boolean', {defaultValue: true}),
  weights: DS.hasMany('option-category-weight', {
    async: false,
  }),
  hasWeights: Ember.computed('weights', function() {
    return this.get('weights.length') > 0;
  }),
  rangeVotes: DS.hasMany('option-category-range-vote', {
    async: false,
  }),
  hasRangeVotes: Ember.computed('rangeVotes', function() {
    return this.get('rangeVotes.length') > 0;
  }),
  options: DS.hasMany('option', {
    async: false, inverse: 'optionCategory',
  }),
  optionIds: Ember.computed.mapBy('options', 'id'),
  commentType: 'OptionCategory',
  cssId: Ember.computed('id', function() {
    return Formatter.cssId('option-category-' + this.get('id'));
  }),
  primaryDetail: DS.belongsTo('option-detail'),
  defaultLowOption: DS.belongsTo('option', {inverse: null}),
  defaultHighOption: DS.belongsTo('option', {inverse: null}),
  topicVoting: DS.attr('boolean'),
  quadratic: DS.attr('boolean'),

  keywords: DS.attr('array', {defaultValue: []}),
  cleanKeywords: Em.computed('keywords', function(){
    // cloned from base-page
      if(!Em.isArray(this.get('keywords')) ) {
        return [];
      }
      return this.get('keywords').filter(x => x).map(x => x.toLowerCase()).sort();
  }),

  votingStyle: DS.attr('string'),

  isSliderOne: Ember.computed('votingStyle', function() {
    return this.get('votingStyle') === 'one';
  }),

  isSliderRange: Ember.computed('votingStyle', function() {
    return this.get('votingStyle') === 'range';
  }),

  valueHashes: Ember.computed('primaryDetail.valueHashes.[]', function() {
    let values = this.get('primaryDetail.valueHashes') || [];
    return values.reduce(function(memo, odvHash) {
      memo[odvHash.option.id] = odvHash;
      return memo;
    }, {});
  }),

  optionIdToTick(optionId){
    if (Em.isEmpty(optionId)) {
      return null;
    }
    let items = this.get('sliderItems');
    let tick = items.findIndex(function(item) {
      return item['value'].toString() === optionId.toString();
    });

    if (Ember.isEmpty(tick) || tick === -1) {
      tick = Math.ceil(items.length / 2);
    }
    return tick;
  },
  sliderItems: Ember.computed('options', 'primaryDetail', 'optionDetailValues', 'tickDetailValues', function() {
    let primaryDetail = this.get('primaryDetail');
    if (Em.isEmpty(primaryDetail)) {
      return [];
    }
    let options = this.get('options');
    let odvHashes = this.get('valueHashes');
    if (odvHashes.length < 1) {
      return [];
    }

    let sliderItems = options.reduce(function(memo, option) {
      if (odvHashes[option.id]) {
        let odvHash = odvHashes[option.id];
        let rawValue = parseFloat(odvHash.value);
        memo.push({
          tooltip: option.get('title'),
          raw_value: isNaN(rawValue) ? 0 : rawValue,
          value: parseInt(option.id),
          id: parseInt(option.id),
          option: option,
          detail: primaryDetail,
          format: odvHash.format,
        });
      }
      return memo;
    }, []);
    return sliderItems.sort(function(a, b) {
      return a.raw_value - b.raw_value; // highest number first
    });
  }),
});
