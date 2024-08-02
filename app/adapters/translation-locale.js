import DecisionApiAdaptor from './decision-api';
export default DecisionApiAdaptor.extend({
  typeToPath(){
    return this._super('locale');
  },
});
