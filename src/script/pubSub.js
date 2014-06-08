var PubSub = require('pubsub-js');

//var tokensbyTopic = {};

var pubSub = {
  publish: function (topic, message) {
    PubSub.publish(topic, message);
  },
  subscribe: function (topic, handler) {
    var token = PubSub.subscribe(topic, handler);

    //tokensbyTopic[topic] = tokensbyTopic[topic] || [];
    //tokensbyTopic[topic].push(token);

    return token;
  },
  unsubscribe: function (tokenOrHandler) {
    PubSub.unsubscribe(tokenOrHandler);
  }
};

module.exports = pubSub;