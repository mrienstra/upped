// Modules
var pubSub = require('../pubSub.js');

var ToggleStackListItem = {
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
    pubSub.unsubscribe(this.state.pubSubDomain + '.toggleStackListItem.' + this.props.key, this.handleToggleDetails);
    pubSub.subscribe(this.state.pubSubDomain + '.toggleStackListItem.' + this.props.key, this.handleToggleDetails);
  },
  handleToggleDetails: function(){
    if (!this.props.fromMenu) {
      console.log('pubsub.subscribe toggleStackListItem.' + this.props.key + ' handleToggleDetails', this.state.expanded);

      pubSub.publish(this.state.pubSubDomain + '.toggleButtons', {expanded: !this.state.expanded});

      this.setState({expanded: !this.state.expanded});
    } else {
      console.log('pubsub.subscribe toggleStackListItem.' + this.props.key + ' handleToggleDetails, ignoring because this.props.fromMenu', this.props.fromMenu);
    }
  }
};

module.exports = ToggleStackListItem;