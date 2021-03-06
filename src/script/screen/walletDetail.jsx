var React = require('react');

// Components
var HistoryListItem = require('../component/historyListItem.jsx');

// Libs
var _ = require('lodash');
var classNames = require('classnames');

// Mixins
var ReactFireMixin = require('reactfire');
var ScreenTransitionMixin = require('../mixin/screenTransition.js');
var SetIntervalMixin = require('../../lib/set-interval-mixin.jsx');

// Modules
var utils = require('../utils');

var WalletDetailScreen = React.createClass({
  mixins: [ReactFireMixin, ScreenTransitionMixin, SetIntervalMixin],
  propTypes: {
    'addNote': React.PropTypes.func,
    'balanceID': React.PropTypes.string,
    'balance': React.PropTypes.object,
    'get': React.PropTypes.func,
    'getHistory': React.PropTypes.func,
    'markHistoryItemRead': React.PropTypes.func,
    'confirmDeduction': React.PropTypes.func,
    'changeScreen': React.PropTypes.func,
    'handleBack': React.PropTypes.func,
    'selfUID': React.PropTypes.string,
    'visible': React.PropTypes.bool,
  },
  getInitialState: function(){
    return {
      createdFromNow: void 0,
      updatedFromNow: void 0,
      balance: void 0,
      history: void 0,
    };
  },
  initFirebase: function (props) {
    if (this.state.balance || this.state.history) {
      this.setState({
        balance: void 0,
        history: void 0,
      });
    }

    if (!props.balanceID) return;

    var history = props.getHistory(props.balanceID);
    this.bindAsObject(history, 'history');

    var balance = props.get(props.balanceID);
    this.bindAsObject(balance, 'balance');
  },
  updateFromNow: function (balance) {
    var createdFromNow, updatedFromNow;

    if (!this.props.balance && !this.state.balance)
     return;

    if (!balance)
      balance = this.state.balance || this.props.balance;

    if (balance.created > Date.now()) {
      createdFromNow = 'just now';
    } else {
      createdFromNow = utils.momentFromNowIfTime(balance.created);
    }

    if (balance.updated > Date.now()) {
      updatedFromNow = 'just now';
    } else {
      updatedFromNow = utils.momentFromNowIfTime(balance.updated);
    }

    if (this.state.createdFromNow !== createdFromNow || this.state.updatedFromNow !== updatedFromNow) {
      this.setState({
        createdFromNow: createdFromNow,
        updatedFromNow: updatedFromNow,
      });
    }
  },
  componentWillMount: function(){
    //console.log('WalletDetailScreen.componentWillMount()', this, arguments);

    this.initFirebase(this.props);

    this.updateFromNow();

    this.setInterval(this.updateFromNow, 5 * 1000);
  },
  componentWillReceiveProps: function (nextProps) {
    if (nextProps.balanceID !== this.props.balanceID) {
      this.initFirebase(nextProps);

      this.updateFromNow(nextProps.balance);
    }
  },
  handleRedeemChange: function (e) {
    this.props.changeScreen('redeemScreen', {state: {balance: this.props.balance, balanceID: this.props.balanceID}});
  },
  handleFulfillChange: function (e) {
    this.props.changeScreen('fulfillScreen', {state: {balance: this.props.balance, balanceID: this.props.balanceID}});
  },
  handleNoteSubmit: function(){
    //console.log('handleNoteSubmit', this, arguments);

    var note = React.findDOMNode(this.refs.noteTextarea).value;

    if (note) {
      var balance = this.state.balance || this.props.balance;
      var selfDataKey = this.props.selfUID + '_data';
      var otherUID = _.find(_.keys(balance), function (val) {
        return val !== selfDataKey && /_data$/.test(val);
      }).split('_data')[0];

      this.props.addNote(this.props.balanceID, note, otherUID);

      React.findDOMNode(this.refs.noteTextarea).value = '';

      _.defer(this.updateFromNow);
    }
  },
  render: function(){
    //console.log('WalletDetailScreen.render', this);

    var that = this;

    var balance = this.state.balance || this.props.balance;

    if (!balance) {
      return (
        <div className={classNames.apply(null, this.state.classNames)}>
          <div className="bar-stable bar bar-header nav-bar disable-user-behavior">
            <div className="button-clear button back-button disable-user-behavior" onTouchEnd={this.props.handleBack}>
              <i className="icon ion-chevron-left"></i> Back
            </div>
            <h1 className="title">Details</h1>
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

    var historyNodes = [];
    _.forIn(this.state.history, function (history, key) {
      var photoURL = (history.uid) ? balance[history.uid + '_data'].photoURL : 'img/new_logo_dark.png';
      var isMine = that.props.selfUID === history.uid;
      historyNodes.push(
        <HistoryListItem key={key} historyItemID={key} history={history} photoURL={photoURL} isMine={isMine} confirmDeduction={that.props.confirmDeduction.bind(null, that.props.balanceID, key)} />
      );

      if (that.props.visible && !isMine && !history.read) {
        _.defer(function(){
          that.props.markHistoryItemRead(that.props.selfUID, that.props.balanceID, key);
        });
      }
    });
    historyNodes.reverse();

    return (
      <div className={classNames.apply(null, this.state.classNames)}>
        <div className="bar-stable bar bar-header nav-bar disable-user-behavior">
          <div className="button-clear button back-button disable-user-behavior" onTouchEnd={this.props.handleBack}>
            <i className="icon ion-chevron-left"></i> Back
          </div>
          <h1 className="title">Details</h1>
        </div>

        <div className="scroll-content overflow-scroll has-header">

          <div className="list">
            <div className="item item-avatar">
              <img src={otherData.photoURL}/>
              <h2>{otherData.name}</h2>
              <p>{utils.formatCurrency(otherData.originalAmount)} credit</p>
            </div>
            <div className="item item-text-wrap">
              <div className="row">
                <div className="col amount">
                  <h2>{utils.formatCurrency(selfData.currentAmount)}</h2>
                  <span>remaining</span>
                </div>
                <div className="col col-75">
                  You Get: {otherData.sushi}
                </div>
              </div>
              <div className="row">
                <div className="col amount">
                  <h2>{utils.formatCurrency(otherData.currentAmount)}</h2>
                  <span>remaining</span>
                </div>
                <div className="col col-75">
                  You Pay: {selfData.sushi}
                </div>
              </div>
            </div>
            <div className="item tabs tabs-secondary tabs-icon-left">
              <a className="tab-item" href="#" onTouchEnd={this.handleRedeemChange}>
                <i className="icon ion-ios-color-wand"></i>
                Redeem
              </a>
              <a className="tab-item" href="#"onTouchEnd={this.handleFulfillChange}>
                <i className="icon ion-ios-list-outline"></i>
                Charge
              </a>
            </div>
            <div className="item item-divider">
              Comment History
            </div>
            <div className="item item-avatar item-commentform">
              <img src={selfData.photoURL}/>
              <textarea ref="noteTextarea" disabled={!this.props.visible}/>
              <button className="button button-small button-assertive" onTouchEnd={this.handleNoteSubmit}>
                Add Comment
              </button>
            </div>
            {historyNodes}
          </div>
        </div>
      </div>
    );
  }
});

module.exports = WalletDetailScreen;