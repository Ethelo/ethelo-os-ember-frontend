import InfluentTools from "frontend/mixins/influent-tools";
import Registry from "frontend/mixins/registry";
import ResultBreakdown from "frontend/mixins/result-breakdown";

export default Ember.Component.extend(
  Registry,
  InfluentTools,
  ResultBreakdown, {
    classNames: ["histogram-bar-chart-slider-voting"],
    // histogram: Ember.computed.alias('result.histogram'),

    //maxValue is advanced-total
    maxValue: Ember.computed("showChart", "", function () {
      let result = this.get("chartData");
      if (result) {
        return result
          .map((x) => {
            return x.y;
          })
          .reduce((a, b) => a + b, 0);
      }
    }),

    showChart: Ember.computed("", function () {
      return true;
    }),

    chartId: Ember.computed("result.id", function () {
      return `hsv-${this.get('result.id')}`;
    }),

    chartData: Ember.computed("", function () {
      if (Ember.isEmpty(this.get("combinedScenarioResults"))) {
        return [];
      }

      let graphData = [];

      // filter options by optionCategory
      let combinedScenarioResults = this.get("combinedScenarioResults");

      let currentOptionCategory = this.get("result");
      let currentOptionCatgoryID = currentOptionCategory.get("option.optionCategory.id") || currentOptionCategory.get("optionCategory.id");
      let allOptionsByCurrentOptionCategory = combinedScenarioResults.filter((x) => x.get("isOptionResult") === true && x.get("option.optionCategory.id") === currentOptionCatgoryID);

      graphData = allOptionsByCurrentOptionCategory.map((result) => {
        let getValueHashes = result.get("option.optionCategory.primaryDetail.valueHashes");
        let valueHashes = !Ember.isEmpty(getValueHashes) ? getValueHashes.toArray() : [];
        let advancedVotes = result.get("advancedVotes");
        let optionTitle = result.get("option.resultsLabel");
        let odvHash = valueHashes.find(x => x.option.id === result.get("option.id"));
        let rawValue = !Ember.isEmpty(odvHash) ? parseFloat(odvHash.value) : 0;
        let graphObject = {
          name: optionTitle,
          y: advancedVotes,
          raw_value: isNaN(rawValue) ? 0 : rawValue,
        };
        return {
          ...graphObject
        };
        //graphData.push({ ...graphObject });
      }).sort(function (a, b) {
        return a.raw_value - b.raw_value; // highest number first
      });

      if (graphData && graphData.length > 0) {
        graphData.forEach(function (v) {
          delete v.raw_value;
        });
      }

      return graphData;
    }),


    chartOptions: Ember.computed(function () {
      let series = this.get("chartData");
      let totalVotes = this.get("maxValue");
      return {
        chart: {
          type: "bar",
          marginRight: 40
        },
        title: {
          text: this.get("popularTitle")
        },
        xAxis: {
          type: "category",
        },
        yAxis: {
          min: 0,
          title: {
            text: "Number of Respondents"
          },
          labels: {
            format: "{value}"
          },
          // max: totalVotes,
          allowDecimals: false
        },
        credits: {
          enabled: false
        },
        legend: {
          enabled: false
        },
        tooltip: {
          formatter: function () {
            return (
              this.point.name + "<br/>" + "Percentage: " + (this.y / totalVotes) * 100
            );
          },
        },
        plotOptions: {
          bar: {
            dataLabels: {
              enabled: true,
              formatter: function () {
                return this.y;
              },
            },
          },
        },
        subtitle: {
          text: `${totalVotes} Voters`
        },
        displayErrors: true,
        series: [{
          name: "",
          data: series,
        }, ],
        colors: ["#516BA6"],
      };
    }),
  }
);
