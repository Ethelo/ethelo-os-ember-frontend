export default Ember.Mixin.create({
  rows: null,
  refresh: false,

  visibleRows: Ember.computed(
    'rows',
    'rows.@each.id',
    'isLoading',
    function() {
      this.get('isLoading'); // must consume for trigger to work

      var allRows = this.get('rows');
      if (!allRows) {
        return null;
      }

      return allRows.toArray();
    }
  ),

  isLoading: Ember.computed('rows', 'rows.@each.id', function() {
    var rows = this.get('rows');
    var isLoading = false;
    if ( Ember.isNone(rows)) {
      isLoading = true;
    } else {
      isLoading = ( rows.isPending && rows.get('isPending') );
    }
    return isLoading;
  }),
  state: Ember.computed('isLoading', 'rows.@each.id', function() {
    var isLoading = this.get('isLoading');
    var count = isLoading ? 0 : this.get('rows').get('length');
    return {
      isLoading: isLoading,
      count: count
    };
  }),
  filterValuesChanged: Ember.observer('filterValues', function() {
    this.get('filterValues'); // must load to trigger observer
    this.updateFilter();
  }),
  filterClass: null,
  filterValues: null,
  filterQuery: null,
  filterMethod: null,
  updateFilter: function() {
    var filterValues = this.get('filterValues');
    var filterClass = this.get('filterClass');
    var filterQuery = this.get('filterQuery');
    var filterMethod = this.get('filterMethod');
    if (this.refresh) {
      filterQuery.refresh = 1;
    }

    Ember.run.once(this, function() {
      this.set('rows', null);
    });

    if ( Ember.isEmpty(filterClass) || Ember.isEmpty(filterQuery) || Ember.isEmpty(filterMethod)) {
      return;
    }

    Ember.run.scheduleOnce('afterRender', this, function() {

      var store = this.get('store');
      var filtered = store.filter(filterClass, filterQuery, this.filterMethod(filterValues));
      this.set('rows', filtered);
      this.refresh = 0;
    });
  }

});
