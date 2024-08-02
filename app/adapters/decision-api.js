import DS from 'ember-data';
const { underscore, pluralize, decamelize } = Ember.String;

export default DS.JSONAPIAdapter.extend({
  singleton: false,
  buildURL(type, id) {
    if(this.singleton){
      return this._super(type, '');
    }
    return this._super(type, id);
  },
  typeToPath(type){
    var decamelized = decamelize(type);
    var underscored = underscore(decamelized);
    if (this.singleton) {
      return underscored;
    }
    return pluralize(underscored);
  },
  pathForType(type) {
    return this.buildNamespace() +  this.typeToPath(type);
  },
  buildNamespace(){
    return 'api/v2' + '/decisions/' + this.get('session.decisionId') + '/';
  },
  host: Ember.computed.alias('session.EtheloServer'),
  ajaxOptions(url, type, hash) {
    hash = this._super(url, type, hash);
    hash.crossDomain = true;
    hash.xhrFields = {withCredentials: true};
    return hash;
  },
});
