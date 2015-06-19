var React = require('react');

// Components
var HistoryListItem = require('../component/historyListItem.jsx');

// Libs
var _ = require('lodash');
var classNames = require('classnames');

// Mixins
var ReactFireMixin = require('reactfire');
var ScreenTransitionMixin = require('../mixin/screenTransition.js');

// Modules
var utils = require('../utils');

var RedeemScreen = React.createClass({
  mixins: [ReactFireMixin, ScreenTransitionMixin],
  propTypes: {
    'balanceID': React.PropTypes.string,
    'balance': React.PropTypes.object,
    'handleProfileChange': React.PropTypes.func,
    'changeScreen': React.PropTypes.func,
    'getHistory': React.PropTypes.func,
    'confirmDeduction': React.PropTypes.func,
    'handleBack': React.PropTypes.func,
    'selfUID': React.PropTypes.string,
    'visible': React.PropTypes.bool,
  },
  getInitialState: function(){
    return {
      history: void 0,
    };
  },
  handleProfileChange: function(){
    var balance = this.props.balance;
    var selfDataKey = this.props.selfUID + '_data';
    var otherUID = _.find(_.keys(balance), function (val) {
      return val !== selfDataKey && /_data$/.test(val);
    }).split('_data')[0];

    this.props.handleProfileChange({state: {
      'uid': otherUID,
      'fromMenu': false,
      'viewingSelf': false,
    }});
  },
  handleChatChange: function (e) {
    this.props.changeScreen('walletDetailScreen', {state: {balance: this.props.balance, balanceID: this.props.balanceID}});
    e.stopPropagation();
  },
  initFirebase: function (props) {
    if (this.state.history) {
      this.setState({
        history: void 0,
      });
    }

    if (!props.balanceID) return;

    var history = props.getHistory(props.balanceID);
    this.bindAsObject(history, 'history');
  },
  componentWillMount: function(){
    this.initFirebase(this.props);
  },
  componentWillReceiveProps: function (nextProps) {
    if (nextProps.balanceID !== this.props.balanceID) {
      this.initFirebase(nextProps);
    }
  },
  render: function(){
    //console.log('RedeemScreen.render', this);

    var that = this;

    var balance = this.props.balance;

    if (!balance) {
      return (
        <div className={classNames.apply(null, this.state.classNames)}>
          <div className="bar-stable bar bar-header nav-bar disable-user-behavior">
            <div className="button-clear button back-button disable-user-behavior" onTouchEnd={this.props.handleBack}>
              <i className="icon ion-chevron-left"></i> Back
            </div>
            <h1 className="title">Redeem</h1>
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
      var isMine = that.props.selfUID === history.uid;
      if (!isMine && history.amount) {
        var photoURL = (history.uid) ? balance[history.uid + '_data'].photoURL : 'img/new_logo_dark.png';
        historyNodes.push(
          <HistoryListItem key={key} historyItemID={key} history={history} photoURL={photoURL} isMine={isMine} confirmDeduction={that.props.confirmDeduction.bind(null, that.props.balanceID, key)} />
        );
      }
    });
    historyNodes.reverse();

    return (
      <div className={classNames.apply(null, this.state.classNames)}>
        <div className="bar-stable bar bar-header nav-bar disable-user-behavior">
          <div className="button-clear button back-button disable-user-behavior" onTouchEnd={this.props.handleBack}>
            <i className="icon ion-chevron-left"></i> Back
          </div>
          <h1 className="title">Redeem</h1>
        </div>

        <div className="scroll-content overflow-scroll has-header">

          <div className="list">
            <div className="item item-avatar">
              <img src={otherData.photoURL}/>
              <h2>{otherData.name}</h2>
              <p>{utils.formatCurrency(selfData.currentAmount)} remaining</p>
            </div>
            <div className="item item-text-wrap center">
              To redeem, get in touch with {otherData.name}. Chat directly within our app!
            </div>
            <div className="item tabs tabs-secondary tabs-icon-left">
              <a className="tab-item" href="#" onTouchEnd={this.handleChatChange}>
                <i className="icon ion-ios-chatboxes-outline"></i>
                Chat
              </a>
              <a className="tab-item" href="#" onTouchEnd={this.handleProfileChange}>
                <i className="icon ion-ios-person"></i>
                  View Profile
              </a>
            </div>
            {historyNodes}
          </div>
        </div>
      </div>
    );
  }
});

module.exports = RedeemScreen;