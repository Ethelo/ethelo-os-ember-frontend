// app/transforms/array.js

import DS from 'ember-data';

export default DS.Transform.extend({
  deserialize(value) {
    if (Ember.isArray(value)) {
      var new_value = value.map( function(object){
         if( Em.typeOf(object) === 'string'|| Em.typeOf(object) === 'number' ){
          return object;
        }
        var new_object = {};
        for(var key in object) {
          if(object.hasOwnProperty(key) && key.indexOf('_') !== 0 ){
            new_object[key.camelize()] = object[key];
          }
        }
        return new_object;
      });
      return Ember.A(new_value);
    } else {
      return Ember.A();
    }
  },
  serialize(value) {
    if (Ember.isArray(value)) {
      return Ember.A(value);
    } else {
      return Ember.A();
    }
  }
});
