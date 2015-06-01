var moment = require('moment');

var utils = {
  formatCurrency: function (n) {
    var minimumFractionDigits;
    var output;

    if (n % 1 === 0) {
      minimumFractionDigits = 0;
    } else {
      minimumFractionDigits = 2;
    }

    output = (n).toLocaleString("en-US", {style: "currency", currency: "USD", minimumFractionDigits: minimumFractionDigits});

    if (output[0] !== '$') {
      output = '$' + output;
      if (/\.\d$/.test(output)) {
        output += '0';
      }
    }

    return output;
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