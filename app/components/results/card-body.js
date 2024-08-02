import FilteredBreakdown from "frontend/mixins/filtered-breakdown";
import Ember from "ember";
import $ from "jquery";

export default Ember.Component.extend(FilteredBreakdown, {
  isInfoExpanded: false,
  showPieChart: false,
  showPeopleChart: Ember.computed('result.totalVotes','statsDisplay.showPeopleChart', function(){
    return this.get('result.totalVotes') > 0 && this.get('statsDisplay.showPeopleChart');
  }),
  showHistogramChart: Ember.computed('result.totalVotes','statsDisplay.showHistogramChart', function(){
    return this.get('result.totalVotes') > 0 && this.get('statsDisplay.showHistogramChart');
  }),

  showTopicVotingChart: Ember.computed.bool( 'result.option.optionCategory.topicVoting'),
  showLikertVotingChart: Ember.computed.not('showTopicVotingChart'),
  renderHistogramChart: true,
  didRender() {
    // Bootstrap tabs and google charts have some issue.
    // so i rerender pie chart on tab click
    let collapseId = this.get("collapseId");

    $(`#${collapseId} [id*=-histogram-tab]`).on("click", () => {
      this.set("renderHistogramChart", false);
      setTimeout(() => {
        this.set("renderHistogramChart", true);
      },200);
    });

    $(`#${collapseId} [id*=-pie-chart]`).one("click", () => {
      this.set("showPieChart", false);
      setTimeout(() => {
        this.set("showPieChart", true);
      });
    });
  },
  actions: {
    toggleExpand() {
      this.toggleProperty("isInfoExpanded");
    }
  }
});
