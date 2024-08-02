import DetailTools from 'frontend/mixins/detail-tools';

export default Ember.Component.extend(DetailTools, {
  i18n: Ember.inject.service(),
  classNames: ["data-table"],
  hasValues: Ember.computed("preparedItems", function () {
    return this.get("preparedItems").length > 0;
  }),

  preparedItems: Ember.computed("items.[]", function () {
    let items = this.get("items");
    return this.prepareForTable(items);
  }),

  formatPrepareItems: Ember.computed("preparedItems", function () {
    let newPreparedItems = [];
    const preparedItems = this.get("preparedItems");
    // format the existing array to new array show that each row can only have 4 attributes
    if (preparedItems && preparedItems.length > 0) {
      let objArray = [];
      preparedItems.forEach((element, index) => {
        objArray.push(element);
        if ((index !== 0 && index % 3 === 0) || index === preparedItems.length - 1) {
          newPreparedItems.push(
            {
              countOfRowsToRender: (12 % objArray.length === 0) ?  12 / objArray.length : 3,
              preparedItems: objArray
            });
          objArray = [];
        }
      });
    }
    return newPreparedItems;
  }),
});
