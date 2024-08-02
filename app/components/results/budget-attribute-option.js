import FilteredBreakdown from "frontend/mixins/filtered-breakdown";
import InfluentTools from "frontend/mixins/influent-tools";
import DetailTools from "frontend/mixins/detail-tools";

export default Ember.Component.extend(
  FilteredBreakdown,
  DetailTools,
  InfluentTools,
  {
    i18n: Ember.inject.service(),
    sortedOptionsBreakdown: Ember.computed(
      "optionBreakdown.[]",
      "selectedDetailID",
      "statsDisplay",
      "allOptionBreakdown",
      function () {
        let optionsBreakdown = this.get("optionBreakdown");
        const sortMethod = this.get("statsDisplay.resultSort");
        if (!this.get("statsDisplay.showOptionCategoryTitles")) {
          optionsBreakdown = this.get("allOptionBreakdown");
        }
        if (sortMethod === "display") {
          optionsBreakdown = this._sortByDisplay(
            optionsBreakdown,
            this.get("statsDisplay.showOptionCategoryTitles")
          );
        }

        if (sortMethod === "sort") {
          optionsBreakdown = this._sortBySortField(optionsBreakdown);
        }

        // Sort options by Primary detail
        if (sortMethod === "detail") {
          let optionWithCalculationsListToSort = [];
          // loop through all options
          optionsBreakdown.forEach((el) => {
            let visibleDetailValues = el
              .get("option.visibleDetailValues")
              .toArray();
            let findDetailFromSelectedDetail = visibleDetailValues.find(
              (x) => x.detailId === this.get("selectedDetailID")
            );
            let optionWithCalculationValueObj = {
              optionID: el.get("option.id"),
              detailCalculationValue: findDetailFromSelectedDetail
                ? parseInt(findDetailFromSelectedDetail.value)
                : 0,
            };
            // Push found detail value for each option
            optionWithCalculationsListToSort.push({
              ...optionWithCalculationValueObj,
            });
          });

          // Arrange the detail value by desc order and take the sorted options.
          const sortedOptions = optionWithCalculationsListToSort
            .sort(function (a, b) {
              return b.detailCalculationValue - a.detailCalculationValue; // highest number first
            })
            .map((x) => x.optionID);

          let orderIndex = function (item) {
            return sortedOptions.indexOf(item.get("id"));
          };

          // Now sort all options by the sortedOptions array
          optionsBreakdown = optionsBreakdown.sort(function (a, b) {
            return orderIndex(a.get("option")) > orderIndex(b.get("option")) ? 1 : -1;
          });
        }

        return optionsBreakdown;
      }
    ),
  }
);
