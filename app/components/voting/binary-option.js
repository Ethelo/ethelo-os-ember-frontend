import DataTableComponent from '../tool/data-table';

export default DataTableComponent.extend({
    items: Ember.computed.alias('option.visibleDetailValues'),
    isCollapsed: Ember.computed('option.info', 'items.[]', 'bottomPaneRequired', function() {
        return this.get('option.info.length') || this.get('items.length') > 2 || this.get('bottomPaneRequired');
    }),
    collapsedItems: Ember.computed('preparedItems.[]', function() {
        return this.get('preparedItems').slice(1);
    }),
});