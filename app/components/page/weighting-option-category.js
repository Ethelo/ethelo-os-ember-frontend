import BasePage from 'frontend/mixins/base-page';
import ContentBlocks from 'frontend/mixins/content-blocks';
import Registry from 'frontend/mixins/registry';
import Formatter from 'frontend/utils/formatters';

export default Ember.Component.extend(BasePage, Registry, ContentBlocks, {
  showPieChart: Ember.computed.alias('page.settings.weighting-chart-enabled'),
  showDescriptions: Ember.computed.alias('page.settings.descriptions-enabled'),
  slidersPanelId: Ember.computed('page.slug', function() {
    return Formatter.cssId('sliders-' + this.get('page.slug'));
  }),
});
