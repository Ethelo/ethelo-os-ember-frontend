import CollapseComponent from "./bootstrap-collapse";
import BinVoteInfluent from "frontend/mixins/bin-vote-influent";
import DetailTools from "frontend/mixins/detail-tools";

export default CollapseComponent.extend(BinVoteInfluent, DetailTools, {
  formattedDetails: Ember.computed("titleDetails.[]", function() {
    return this.formatItems(this.get("titleDetails"));
  }),

  hasDetails: Ember.computed("formattedDetails", function() {
    return this.get("formattedDetails").length > 0;
  }),
  didInsertElement() {
    this._super(...arguments);
    // Allow trigger of saveVotes() on space and enter button when using tab navigation.
    const collapseId = this.get("elementId");
    const emberContext = this;
    $(document).on(
      "keydown",
      `#${collapseId}-binary-collapse-accessibility`,
      function(event) {
        if(
          event.keyCode === 13 ||
          event.key === "Enter" ||
          event.keyCode === 32 ||
          event.key === " "
        ) {
          emberContext.send("saveVotes");
        }
      }
    );
  },
  actions: {
    saveVotes() {
      const toggledBin = this.get("binaryVoteValue") === "yes" ? 0 : this.get("binCount");
      if(this.get("isBinaryOne")) {
        this.send("toggleBinaryOne", toggledBin);
      } else {
        this.send("saveBinaryVotes", toggledBin);
      }
    },
  },
});
