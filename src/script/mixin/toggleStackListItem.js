// Modules
var pubSub = require('../pubSub.js');

var ToggleStackListItemMixin = {
  getInitialState: function(){
    var pubSubDomain;
    if (this.props.user) pubSubDomain = 'heroes';
    if (this.props.gathering) pubSubDomain = 'gatherings';

    return {
      expanded: !!this.props.fromMenu,
      pubSubDomain: pubSubDomain
    };
  },
  componentWillMount: function(){
    pubSub.unsubscribe(this.state.pubSubDomain + '.toggleStackListItem.' + this.props.index, this.handleToggleDetails);
    pubSub.subscribe(this.state.pubSubDomain + '.toggleStackListItem.' + this.props.index, this.handleToggleDetails);
  },
  handleToggleDetails: function(){
    if (!this.props.fromMenu) {
      console.log('pubsub.subscribe toggleStackListItem.' + this.props.index + ' handleToggleDetails', this.state.expanded);

      pubSub.publish(this.state.pubSubDomain + '.toggleButtons', {expanded: !this.state.expanded});

      this.setState({expanded: !this.state.expanded});
    } else {
      console.log('pubsub.subscribe toggleStackListItem.' + this.props.index + ' handleToggleDetails, ignoring because this.props.fromMenu', this.props.fromMenu);
    }
  }
};

module.exports = ToggleStackListItemMixin;