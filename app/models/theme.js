import DS from "ember-data";
//import VoteScale from '../utils/vote-scale';

export default DS.Model.extend({
  decision: DS.belongsTo("decision", {
    async: false,
  }),

  primaryColor: DS.attr("string", {defaultValue: "#032444"}),
  secondaryColor: DS.attr("string", {defaultValue: "#93b6d9"}),
  navigationCurrent: DS.attr("string", {defaultValue: "#e9eef5"}),
  navigationHover: DS.attr("string", {defaultValue: "#e3d8e3"}),
  bin1Color: DS.attr("string", {defaultValue: "#85a7ca"}),
  bin2Color: DS.attr("string", {defaultValue: "#7699bb"}),
  bin3Color: DS.attr("string", {defaultValue: "#688aac"}),
  bin4Color: DS.attr("string", {defaultValue: "#597c9d"}),
  bin5Color: DS.attr("string", {defaultValue: "#4b6d8f"}),
  bin6Color: DS.attr("string", {defaultValue: "#3d5e80"}),
  bin7Color: DS.attr("string", {defaultValue: "#2e5071"}),
  bin8Color: DS.attr("string", {defaultValue: "#204162"}),
  bin9Color: DS.attr("string", {defaultValue: "#113353"}),
  noColor: DS.attr("string", {defaultValue: "#93b6d9"}),
  yesColor: DS.attr("string", {defaultValue: "#042546"}),
  chart1Color: DS.attr("string", {defaultValue: "#e6194B"}),
  chart2Color: DS.attr("string", {defaultValue: "#3cb44b"}),
  chart3Color: DS.attr("string", {defaultValue: "#ffe119"}),
  chart4Color: DS.attr("string", {defaultValue: "#f58231"}),
  chart5Color: DS.attr("string", {defaultValue: "#911eb4"}),
  chart6Color: DS.attr("string", {defaultValue: "#f032e6"}),
  chart7Color: DS.attr("string", {defaultValue: "#bfef45"}),
  chart8Color: DS.attr("string", {defaultValue: "#fabed4"}),
  chart9Color: DS.attr("string", {defaultValue: "#469990"}),
  chart10Color: DS.attr("string", {defaultValue: "#dcbeff"}),
  chart11Color: DS.attr("string", {defaultValue: "#9A6324"}),
  chart12Color: DS.attr("string", {defaultValue: "#fffac8"}),
  chart13Color: DS.attr("string", {defaultValue: "#800000"}),
  chart14Color: DS.attr("string", {defaultValue: "#aaffc3"}),
  chart15Color: DS.attr("string", {defaultValue: "#808000"}),
  chart16Color: DS.attr("string", {defaultValue: "#ffd8b1"}),
  chart17Color: DS.attr("string", {defaultValue: "#000075"}),
  chart18Color: DS.attr("string", {defaultValue: "#a9a9a9"}),
  logoAltText: DS.attr("string", {defaultValue: 'Logo'}),

  enableProgressBar: DS.attr('boolean'),
  progressMode: DS.attr('string', {defaultValue: 'all'}),
  progressRequiredItemsOnly: Ember.computed.equal('progressMode', 'required'),
  toggleMenuProgress: DS.attr('boolean'),
  enableBottomNext: DS.attr('boolean', {defaultValue: 'all'}),
  enableSidebarNext: DS.attr('boolean', {defaultValue: 'all'}),

  sharing: DS.attr(),

  /* social sharing */
  hasDefaultSharing: Ember.computed('defaultSharingInfo', function () {
    return !Ember.isEmpty(this.get('defaultSharingInfo'));
  }),

  /* default info for social sharing */
  defaultSharingInfo: Ember.computed.alias('sharing'),

  logoUrl: DS.attr("string"),
  logo: Ember.computed("logoUrl", function () {
    return (
      this.get("logoUrl")
    );
  }),

  enableFilters: DS.attr('boolean', {defaultValue: false}),
  collapseFilters: DS.attr('boolean', {defaultValue: true}),
  enableVotingFilter: DS.attr('boolean', {defaultValue: true}),
  filter1Caption: DS.attr('string'),
  filter1Keywords: DS.attr('array', {defaultValue: []}),
  filter2Caption: DS.attr('string'),
  filter2Keywords: DS.attr('array', {defaultValue: []}),
  filter3Caption: DS.attr('string'),
  filter3Keywords: DS.attr('array', {defaultValue: []}),
  filter4Caption: DS.attr('string'),
  filter4Keywords: DS.attr('array', {defaultValue: []}),

  chartColors: Ember.computed("bin1Color", function () {
    let chartColors = [
      this.get("chart1Color"),
      this.get("chart2Color"),
      this.get("chart3Color"),
      this.get("chart4Color"),
      this.get("chart5Color"),
      this.get("chart6Color"),
      this.get("chart7Color"),
      this.get("chart8Color"),
      this.get("chart9Color"),
      this.get("chart10Color"),
      this.get("chart11Color"),
      this.get("chart12Color"),
      this.get("chart13Color"),
      this.get("chart14Color"),
      this.get("chart15Color"),
      this.get("chart16Color"),
      this.get("chart17Color"),
      this.get("chart18Color"),
    ];
    chartColors.filter(function (value, index, self) {
      return self.indexOf(value) === index;
    });

    return chartColors;
  }),

  chartColorList(numberNeeded) {
    let colorList = this.get("chartColors") || [];
    if (colorList) {
      if (numberNeeded > colorList.length) {
        numberNeeded = numberNeeded - colorList.length;
        let generatedColors = this.generateUniqueColors(colorList, numberNeeded) || [];
        if (generatedColors) {
          colorList = generatedColors;
        }
      }
    }
    return colorList;
  },
  generateUniqueColors: function (existingColorsArray, numberNeeded) {
    let uniqueColors = existingColorsArray;
    for (let index = 0; index < numberNeeded; index++) {
      let color =
        "#" + Math.floor(Math.random() * 16777215).toString(16);
      if (
        uniqueColors.indexOf(color) !== -1 ||
        color.toLowerCase() === "#ffffff" ||
        color.toLowerCase() === "#000000"
      ) {
        index--;
      } else {
        uniqueColors.push(color);
      }
    }
    return uniqueColors;
  },
});
