import BinVoteInfluent from 'frontend/mixins/bin-vote-influent';
import Registry from 'frontend/mixins/registry';


export default Ember.Component.extend(Registry, BinVoteInfluent, {
  classNames: ['histogram-people-container'],
  histogram: Ember.computed('result.histogram', 'uniqueGraphId',
    'result.isOptionResult',
    'registry.decision.criteria.length',
    function() {
      this.get('uniqueGraphId'); //observe
      let histogram = this.get('result.histogram');
      if(Ember.isEmpty(histogram)) {
        return [];
      }
      if(!this.get('result.isOptionResult')) {
        return histogram;
      }
      let criteriaCount = this.get('registry.decision.criteria.length');
      if(criteriaCount < 2) {
        return histogram;
      }
      let expanded = [];

      // "histogram":[0,1,0,1,0],

      for(let len = histogram.length, index = 0; index < len; ++index) {
        expanded = expanded.concat(Array(histogram[index]).fill(index, 0));
      }

      //# of criteria / 2 -> round up, and break point, grab nth vote for each number of criteria
      let sampleCount = Math.floor(expanded.length / this.get('result.totalVotes')) - 1;

      let expandedCount = expanded.length;
      let sampleAt = sampleCount;
      let collapsed = Array(histogram.length).fill(0, 0);

      while(sampleAt < expandedCount) {
        let item = expanded[sampleAt];
        sampleAt = sampleAt + sampleCount;
        collapsed[item]++;
      }

      return collapsed;

    }),
  randomSeed: {},
  showChart: Ember.computed('histogram', function() {
    return !Ember.isEmpty(this.get('histogram'));
  }),
  uniqueGraphId: Ember.computed('result.id', 'result.totalVotes', function() {
    return `${this.get('result.id')}-${this.get('result.totalVotes')}`;
  }),
  didInsertElement() {
    this.updateGraph();
  },
  binToTextClass(value){
    let binName = this.binNameFor(value);
    return this.textClassFor(binName);
  },
  leftKey: Ember.computed(function() {
    return this.captionKeyForBin(1, 'support');
  }),
  neutralKey: Ember.computed(function() {
    return this.captionKeyForBin(this.get('neutralBin'), 'support');
  }),
  rightKey: Ember.computed('binCount', function() {
    return this.captionKeyForBin(this.get('binCount'), 'support');
  }),
  onDataChanged: Ember.observer('histogram', 'uniqueGraphId', function() {
    this.updateGraph();
  }),
  maxValue: Ember.computed('showChart', 'histogram', function() {
    if (this.get('showChart')) {
      let hist = this.get('histogram');
      return Math.max(...hist);
    } else {
      return 0;
    }
  }),
  rng: Ember.computed('uniqueGraphId', function() {
    return new Math.seedrandom(this.get('uniqueGraphId'));
  }),
  randomValue(){
    return this.get('rng')();
  },
  updateGraph(){
    let points = this.generatePoints(this.get('histogram'));
    console.log( "updating graph");
    this.applyPoints(points);
  },
  // instead of randomly picking a value, shuffle and then select each in order
  baseSymbolList: Ember.computed('uniqueGraphId', function() {
    let self = this;
    let symbols = 'efhlopsvyDFGLMNPSTWYZ4567890'.split('');
    return symbols.sort(function() {
      return self.randomValue() - 0.5;
    });
  }),
  currentSymbolList: [],
  nextPersonSymbol(){
    let symbolList = this.get('currentSymbolList');
    if (symbolList.length < 1) {
      symbolList = this.get('baseSymbolList').copy();
    }
    let symbol = symbolList.pop();
    this.set('currentSymbolList', symbolList);
    return symbol;
  },
  maxPerBin: 6.0,
  generatePoints(histogram){
    if (Ember.isEmpty(histogram)) {
      return [];
    }

    let self = this;
    let points = [];
    let maxValue = this.get('maxValue');
    let scale = 1.0;
    let maxPerBin = this.get('maxPerBin');
    if (maxValue > maxPerBin) {
      scale = maxPerBin / maxValue;
    }

    for (let len = histogram.length, index = 0; index < len; ++index) {
      let displayCount = histogram[index] * scale;
      let bin = index + 1;

      for (let j = 0; j < displayCount; j++) {
        points.push({
          x: self.xForPoint(j, bin),
          y: Math.floor(self.randomValue() * 9) - 4,
          char: self.nextPersonSymbol(),
          textClass: this.binToTextClass(bin)
        });
      }
    }

    return points;
  },
  xForPoint(index, bin){
    let binCount = this.get('histogram.length');
    let binWidth = (100 / binCount); // 100 = 100% width
    let binOffset = (binWidth * bin) - binWidth;
    let innerOffset;
    let neutralBin = this.get('neutralBin');
    if (index === 0) {
      // place the first values at the extremes
      if (bin < neutralBin) {
        innerOffset = 0.01; // negative bin to the left
      } else if (bin === neutralBin) {
        innerOffset = 0.5; // neutral centered
      } else if (bin > neutralBin) {
        innerOffset = 0.95; // positive bin to the right
      }
    } else {
      innerOffset = Math.min(this.randomValue() + 0.01, 1); // add a small amount to allow overlapping edges of bins
    }
    return binOffset + (innerOffset * binWidth);
  },

  applyPoints(points){
    let container = $(this.get('element')).find('.points-container');
    let values, point;
    container.find('.person').remove();

    for (let len = points.length, index = 0; index < len; ++index) {
      values = points[index];
      point = $('<div class="person"></div>');
      point.css('margin-left', values.x + '%');
      point.css('margin-top', values.y + 'px');
      point.text(values.char);
      point.addClass(values.textClass);
      point.appendTo(container);
    }
  }
});
