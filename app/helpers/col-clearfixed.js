

export default Ember.Helper.helper(function([i, xs, sm, md, lg]) {
  var out = "";
  out += 'col-xs-' + xs;
  if (i % (12 / xs) === 0) {
    out += ' col-xs-clearfix';
  }

  out += ' col-sm-' + sm;
  if (i % (12 / sm) === 0) {
    out += ' col-sm-clearfix';
  }

  out += ' col-md-' + md;
  if (i % (12 / md) === 0) {
    out += ' col-md-clearfix';
  }

  out += ' col-lg-' + lg;
  if (i % (12 / lg) === 0) {
    out += ' col-lg-clearfix';
  }

  return new Ember.Handlebars.SafeString(out);
});

