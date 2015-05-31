var moment = require('moment');

var utils = {
  formatCurrency: function (n) {
    var minimumFractionDigits;

    if (n % 1 === 0) {
      minimumFractionDigits = 0;
    } else {
      minimumFractionDigits = 2;
    }

    return (n).toLocaleString("en-US", {style: "currency", currency: "USD", minimumFractionDigits: minimumFractionDigits});
  },
  momentFromNowIfTime: function (time) {
    var formattedTime = moment(time);

    if (formattedTime.isValid()) {
      formattedTime = formattedTime.fromNow();
    } else {
      formattedTime = time;
    }

    return formattedTime;
  },
  momentFormatIfTime: function (time) {
    var formattedTime = moment(time);

    if (formattedTime.isValid()) {
      formattedTime = formattedTime.format('dddd, MMMM Do, YYYY, h:mma');
    } else {
      formattedTime = time;
    }

    return formattedTime;
  }
};

module.exports = utils;