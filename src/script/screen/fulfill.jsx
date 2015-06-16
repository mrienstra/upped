var React = require('react');

// Components
var HistoryListItem = require('../component/historyListItem.jsx');

// Libs
var _ = require('lodash');
var classNames = require('classnames');
var Firebase = require('firebase');

// Mixins
var ReactFireMixin = require('reactfire');
var ScreenTransitionMixin = require('../mixin/screenTransition.js');

// Modules
var utils = require('../utils');

var FulfillScreen = React.createClass({
  mixins: [ReactFireMixin, ScreenTransitionMixin],
  propTypes: {
    'addNote': React.PropTypes.func,
    'balance': React.PropTypes.object,
    'get': React.PropTypes.func,
    'doDeduct': React.PropTypes.func,
    'handleBack': React.PropTypes.func,
    'selfUID': React.PropTypes.string,
    'visible': React.PropTypes.bool,
  },
  getInitialState: function(){
    return {
      createdFromNow: void 0,
      updatedFromNow: void 0,
    };
  },
  handleFulfillSubmit: function(){
    console.log('handleFulfillSubmit', this, arguments);

    var amount = parseFloat(React.findDOMNode(this.refs.amountInput).value);
    var comment = React.findDOMNode(this.refs.commentTextarea).value;

    var balance = this.state.balance || this.props.balance;

    var selfDataKey = this.props.selfUID + '_data';
    var selfData = balance[selfDataKey];
    var otherUID = _.find(_.keys(balance), function (val) {
      return val !== selfDataKey && /_data$/.test(val);
    }).split('_data')[0];
    var otherData = balance[otherUID + '_data'];

    if (amount && amount > 0 && amount <= otherData.currentAmount && comment) {
      this.props.doDeduct(this.props.balanceID, comment, otherUID, otherData.unread, otherData.currentAmount, amount);

      React.findDOMNode(this.refs.amountInput).value = '';
      React.findDOMNode(this.refs.commentTextarea).value = '';
    }
  },
  initFirebase: function (props) {
    var balance = props.get(props.balanceID);

    this.bindAsObject(balance, 'balance');
  },
  componentWillMount: function(){
    console.log('FulfillScreen.componentWillMount()', this, arguments);

    this.initFirebase(this.props);
  },
  componentWillReceiveProps: function (nextProps) {
    this.initFirebase(nextProps);
  },
  render: function(){
    console.log('FulfillScreen.render', this);

    var balance = this.state.balance || this.props.balance;

    if (!balance) {
      return (
        <div className={classNames.apply(null, this.state.classNames)}>
          <div className="bar-stable bar bar-header nav-bar disable-user-behavior">
            <div className="button-clear button back-button disable-user-behavior" onTouchEnd={this.props.handleBack}>
              <i className="icon ion-chevron-left"></i> Back
            </div>
            <h1 className="title">FULFILL</h1>
          </div>

          <div className="scroll-content has-header">
          </div>
        </div>
      );
    }

    var selfDataKey = this.props.selfUID + '_data';
    var selfData = balance[selfDataKey];
    var otherData = _.find(balance, function (val, key) {
      return key !== selfDataKey && /_data$/.test(key);
    });

    return (
      <div className={classNames.apply(null, this.state.classNames)}>
        <div className="bar-stable bar bar-header nav-bar disable-user-behavior">
          <div className="button-clear button back-button disable-user-behavior" onTouchEnd={this.props.handleBack}>
            <i className="icon ion-chevron-left"></i> Back
          </div>
          <h1 className="title">FULFILL</h1>
        </div>

        <div className="scroll-content overflow-scroll has-header">

          <div className="list">
            <div className="item item-avatar">
              <img src={otherData.photoURL}/>
              <h2>{otherData.name}</h2>
              <p>{utils.formatCurrency(otherData.currentAmount)} remaining</p>
            </div>
            <div className="item item-text-wrap item-fulfillform">
              <p>Indicate how much work (approximate dollar value) you completed below, and include a brief note explaining what you did.</p>
              <div className="row">
                <div className="col col-12-5">
                  <input type="number" placeholder="$" ref="amountInput"/>
                </div>
                <div className="col">
                  <textarea ref="commentTextarea"/>
                  <button className="button button-small button-positive" onTouchEnd={this.handleFulfillSubmit}>
                    Charge for work
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = FulfillScreen;