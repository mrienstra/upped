// Modules
var pubSub = require('./pubSub.js');
var remote = require('./remote.js');

var interval = 0.5 * 60 * 1000; // ms

var checkForActivityIntId; // used by `puller.stop`

var count = {
  seen: void 0,
  total: void 0,
  unseen: void 0
};

pubSub.subscribe('activity.seenOrTotal', function (topic, data) {
  console.log('puller pubSub subscribe', arguments, count);

  if (data.count && data.count.total && data.count.total !== count.total) {
    // Total count has changed (new activity)
    count.total = data.count.total;

    if (count.seen === void 0) count.seen = data.count.total;
  }

  if (data.count && data.count.seen && data.count.seen !== count.seen) {
    // Seen count has changed
    count.seen = data.count.seen;
  }

  var newUnseen = count.total - count.seen;
  if (newUnseen !== count.unseen) {
    // Unseen count has changed
    count.unseen = newUnseen;
    pubSub.publish('activity.unseen', {count: {unseen: newUnseen}});
  }
});

var checkForActivity = function(){
  remote.parse.activity.getCount().then(
    function (fetchedCount) {
      console.log('checkForActivity then', fetchedCount);

      if (fetchedCount !== count.total) {
        pubSub.publish('activity.seenOrTotal', {count: {total: fetchedCount}});
      }
    },
    function(){ console.error('checkForActivity then', arguments); }
  );
};

var puller = {
  start: function (options) {
    var checkInterval = (options && options.interval) || interval;

    puller.stop();

    checkForActivityIntId = window.setInterval(checkForActivity, checkInterval);
  },
  stop: function(){
    window.clearInterval(checkForActivityIntId);
  }
};

module.exports = puller;