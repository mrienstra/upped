var React = require('react');

// Mixins
var SetIntervalMixin = require('../../lib/set-interval-mixin.jsx');

// Modules
var utils = require('../utils');

var HistoryListItem = React.createClass({
  mixins: [SetIntervalMixin],
  propTypes: {
    'history': React.PropTypes.object,
    'name': React.PropTypes.string,
    'photoURL': React.PropTypes.string,
  },
  getInitialState: function(){
    return {
      fromNow: void 0,
    };
  },
  updateFromNow: function (timestamp) {
    var fromNow;

    if (timestamp === void 0)
      timestamp = this.props.history.timestamp;

    if (timestamp > Date.now()) {
      fromNow = 'just now';
    } else {
      fromNow = utils.momentFromNowIfTime(timestamp);
    }

    this.setState({fromNow: fromNow});
  },
  componentWillMount: function(){
    this.updateFromNow();

    this.setInterval(this.updateFromNow, 5 * 1000);
  },
  componentWillReceiveProps: function (nextProps) {
    this.updateFromNow(nextProps.history.timestamp);
  },
  render: function() {
    var firstLine;
    if (this.props.history.amount) {
      firstLine = (
        <div>
          {utils.formatCurrency(this.props.history.amount)} {this.props.history.action}
        </div>
      );
    }
    return (
      <div className="item item-avatar">
        <img src={this.props.photoURL} />
        {firstLine}
        <p>{this.props.history.note}</p>
        <p className="subdued">{this.state.fromNow}</p>
      </div>
    );
  }
});

module.exports = HistoryListItem;