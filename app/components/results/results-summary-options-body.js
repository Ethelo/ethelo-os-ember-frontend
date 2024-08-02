import FilteredBreakdown from "frontend/mixins/filtered-breakdown";
import Ember from "ember";
import $ from "jquery";

export default Ember.Component.extend(FilteredBreakdown, {
  isInfoExpanded: false,
  showPieChart: false,
  showMetricChart: Ember.computed('result.totalVotes', 'statsDisplay.showMetricChart', function () {
    return this.get('result.totalVotes') > 0 && this.get('statsDisplay.showMetricChart');
  }),
  showPeopleChart: Ember.computed('result.totalVotes', 'statsDisplay.showPeopleChart', function () {
    return this.get('result.totalVotes') > 0 && this.get('statsDisplay.showPeopleChart');
  }),
  showHistogramChart: Ember.computed('result.totalVotes', 'statsDisplay.showHistogramChart', function () {
    return this.get('result.totalVotes') > 0 && this.get('statsDisplay.showHistogramChart');
  }),
  peopleCount: Ember.computed.alias('result.totalVotes'),
  showTopicVotingChart: Ember.computed.bool('result.option.optionCategory.topicVoting'),
  showLikertVotingChart: Ember.computed.not('showTopicVotingChart'),
  renderHistogramChart: true,
  defaultActiveTabName: Ember.computed('statsDisplay', 'showMetricChart', 'showPeopleChart', 'showHistogramChart', function () {
    const showMetricChart = this.get('showMetricChart'),
      showPeopleChart = this.get('showPeopleChart'),
      showHistogramChart = this.get('showHistogramChart'),
      showOptionDetails = this.get('statsDisplay.showOptionDetails'),
      showOptionCriteriaStats = this.get('displayCriteria');
    if (showOptionCriteriaStats) {
      return 'criteria-tab';
    }
    if (showMetricChart) {
      return 'metrics-tab';
    }
    if (showPeopleChart) {
      return 'people-tab';
    }
    if (showHistogramChart) {
      return 'histogram-tab';
    }
    if (showOptionDetails) {
      return 'info-tab';
    }
  }),
  didRender() {
    // Bootstrap tabs and google charts have some issue.
    // so i rerender pie chart on tab click
    let collapseId = this.get("collapseId");

    $(`#${collapseId} [id*=-histogram-tab]`).on("click", () => {
      this.set("renderHistogramChart", false);
      setTimeout(() => {
        this.set("renderHistogramChart", true);
      }, 200);
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
