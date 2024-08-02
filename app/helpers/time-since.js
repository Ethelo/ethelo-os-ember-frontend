/*
 @todo: in the future, ask only for necessary dictionaries via ajax during app init
 @note: should there be a moment service with a singleton to handle init and dictionary loading?
 */

export default Ember.Helper.extend({
  i18n: Ember.inject.service(),
  compute([date]) {
    if (!date) {
      return null;
    }

    var monthDate, time;
    var i18n = this.get('i18n');

    var momentDate = moment(date);
    var secondsPast = moment().diff(momentDate, 'seconds');

    if (secondsPast <= 86400) {
      return momentDate.fromNow();
    }

    if (secondsPast <= 2 * 86400) {
      time = momentDate.format('h:mma');
      return i18n.t('time_since.yesterday', {time});
    }

    [monthDate, time] = momentDate.format('MMMM D,h:mma').split(',');

    return i18n.t('time_since.date_time', {monthDate, time});
  }
});
