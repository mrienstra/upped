// Modules
var pubSub = require('../pubSub.js');

var BadgeMixin = {
  getInitialState: function(){
    return {
      newCount: void 0
    };
  },
  componentWillMount: function(){
    var that = this;

    pubSub.subscribe('activity.unseen', function (topic, data) {
      console.log('badgeMixin.componentWillMount pubSub subscribe', arguments);

      if (data.count.unseen !== that.state.newCount) {
        that.setState({newCount: data.count.unseen});
      }
    });
  }
};

module.exports = BadgeMixin;