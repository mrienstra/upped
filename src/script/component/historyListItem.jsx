var React = require('react');

// Mixins
var SetIntervalMixin = require('../../lib/set-interval-mixin.jsx');

// Modules
var utils = require('../utils');

var HistoryListItem = React.createClass({
  mixins: [SetIntervalMixin],
  propTypes: {
    'history': React.PropTypes.object,
    'photoURL': React.PropTypes.string,
    'isMine': React.PropTypes.bool,
    'confirmDeduction': React.PropTypes.func,
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
    var history = this.props.history;

    var topRight, firstLine, action;
    if (history.amount) {
      if (history.action === 'opened') {
        action = 'credit';
        topRight = 'opened';
      } else {
        action = history.action;
        if (this.props.isMine) {
          action = 'fulfilled';

          if (history.confirmed) {
            topRight = 'confirmed';
          }
        } else {
          action = 'redeemed';

          if (history.confirmed) {
            topRight = 'confirmed';
          } else {
            topRight = (
              <a className="button button-small button-stable" href="#" onTouchEnd={this.props.confirmDeduction}>Confirm</a>
            );
          }
        }
      }

      topRight = (
        <div className="right">{topRight}</div>
      );

      firstLine = (
        <div>
          {utils.formatCurrency(history.amount)} {action}
        </div>
      );
    }

    return (
      <div className="item item-avatar item-text-wrap item-history">
        <img src={this.props.photoURL} />
        {topRight}
        {firstLine}
        <p>{history.note}</p>
        <p className="subdued">{this.state.fromNow}</p>
      </div>
    );
  }
});

module.exports = HistoryListItem;