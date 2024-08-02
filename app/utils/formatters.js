const formatter = {
  cssId(value /*, i18n*/) {
    return value.toString().toLowerCase().dasherize();
  },
  percent(value /*, i18n*/) {
    let format = "0%";
    return numeral(value).format(format);
  },
  percent_with_decimals(value /*, i18n*/) {
    let format = "0.00%";
    return numeral(value).format(format);
  },
  date(value /*, i18n*/) {
    return moment(value).format("MMM Do YYYY, h:mm a");
  },
  money(value /*, i18n*/) {
    let format = value.toString().indexOf('.') !== -1 ? "$0,0.00" : "$0,0";
    return numeral(value).format(format);
  },
  dollars(value /*, i18n*/) {
    let format = "$0,0";
    return numeral(value).format(format);
  },
  big_dollars(value /*, i18n*/) {
    let format = "$0,0 a";
    return numeral(value).format(format);
  },
  dollars_and_cents(value /*, i18n*/) {
    let format = "$0,0.00";
    return numeral(value).format(format);
  },
  number(value /*, i18n*/) {
    let format = "0,0";
    return numeral(value).format(format);
  },
  big_number(value /*, i18n*/) {
    let format = "0,0 a";
    return numeral(value).format(format);
  },
  number_with_decimals(value /*, i18n*/) {
    let format = "0,0.00";
    return numeral(value).format(format);
  },
  yes_no(value, i18n) {
    let boolean = value.toString() === 'true' || value === true;
    if (boolean) {
      return i18n.t('data_table.true');
    } else {
      return i18n.t('data_table.false');
    }
  },
  ethelo(value /*, i18n*/) {
    if (Ember.isNone(value)) {
      return null;
    }
    if (value === null) {
      value = 0;
    }
    let parsed = (parseFloat(value)).toFixed(2);
    parsed = moment.localeData().postformat(parsed);
    return parsed + '&#8712;';
  },
  support(value /*, i18n*/) {
    let parsed = (parseFloat(value)).toFixed(2);
    value = moment.localeData().postformat(parsed);
    return parsed + '&#x024C8;';
  },
  dissonance(value /*, i18n*/) {
    let parsed = (parseFloat(value)).toFixed(2);
    value = moment.localeData().postformat(parsed);
    return parsed + '&#x00394;';
  },
  approval(value /*, i18n*/) {
    return this.percent_with_decimals(value.toFixed(2));
  },
  voterPercent(value /*, i18n*/) {
    return this.percent_with_decimals(value.toFixed(2));
  },

};

export default formatter;
