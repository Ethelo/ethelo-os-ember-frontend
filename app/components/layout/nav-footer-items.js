import Registry from 'frontend/mixins/registry';
import LeftColumn from "frontend/mixins/left-column";

export default Ember.Component.extend(Registry, LeftColumn, {
  classNames: ['list-group panel panel-default bootstrap-collapse footer-nav']
});
