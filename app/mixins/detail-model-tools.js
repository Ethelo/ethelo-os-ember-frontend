
export default Ember.Mixin.create({


  buildDetailValueHash(optionDetailValues){
    if (optionDetailValues.length < 1) {
      return [];
    }
    let details = optionDetailValues.map(function(odv) {
      return {
        id: odv.get('id'),
        label: odv.get('optionDetail.title'),
        detailId: odv.get('optionDetail.id'),
        format: odv.get('optionDetail.format'),
        value: odv.get('value'),
        visible: odv.get('optionDetail.visible'),
        slug: odv.get('optionDetail.slug'),
        showBlank: false,
        sort: odv.get('optionDetail.sort'),
        option: odv.get('option'),
      };
    });
    return details.toArray().sortBy('label').sortBy('sort');
  },

  filterVisible: function(items) {
    return items.filter(function(item) {
      return item.visible && ( !Ember.isEmpty(item.value) || item.showBlank );
    });
  }

});
