var moment = require('moment');

var utils = {
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