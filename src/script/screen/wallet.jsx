var React = require('react');

// Libs
var _ = require('lodash');
var classNames = require('classnames');
var Firebase = require('firebase');

// Mixins
var ReactFireMixin = require('reactfire');
var ScreenTransitionMixin = require('../mixin/screenTransition.js');
var SetIntervalMixin = require('../../lib/set-interval-mixin.jsx');

// Modules
var utils = require('../utils');

var BalanceCard = React.createClass({
  mixins: [SetIntervalMixin],
  getInitialState: function(){
    return {
      updatedFromNow: void 0,
    };
  },
  updateFromNow: function (balance) {
    var updatedFromNow;

    if (!balance && !this.props.balance)
     return;

    if (!balance)
      balance = this.props.balance;

    if (balance.updated > Date.now()) {
      updatedFromNow = 'just now';
    } else {
      updatedFromNow = utils.momentFromNowIfTime(balance.updated);
    }

    if (this.state.updatedFromNow !== updatedFromNow) {
      this.setState({
        updatedFromNow: updatedFromNow,
      });
    }
  },
  handleRedeemChange: function (e) {
    this.props.changeScreen('redeemScreen', {state: {balance: this.props.balance}});
    e.stopPropagation();
  },
  handleChatChange: function (e) {
    this.props.changeScreen('walletDetailScreen', {state: {balance: this.props.balance, balanceID: this.props.balanceID}});
    e.stopPropagation();
  },
  handleFulfillChange: function (e) {
    this.props.changeScreen('fulfillScreen', {state: {balance: this.props.balance, balanceID: this.props.balanceID}});
    e.stopPropagation();
  },
  componentWillMount: function(){
    this.updateFromNow();

    this.setInterval(this.updateFromNow, 5 * 1000);
  },
  componentWillReceiveProps: function (nextProps) {
    this.updateFromNow(nextProps.balance);
  },
  render: function() {
    var balance = this.props.balance;
    var selfDataKey = this.props.selfUID + '_data';
    var selfData = balance[selfDataKey];
    var otherData = _.find(balance, function (val, key) {
      return key !== selfDataKey && /_data$/.test(key);
    });

    /*
    created
    updated
    [each uid has a key with a truthy value]
    [for each uid, with key uid + '_data']
      currentAmount
      originalAmount
      name
      photoURL
      sushi
      unread
    */

    return (
      <div className="card wallet-card" onTouchEnd={this.handleChatChange}>
        <div className="item item-avatar">
          <img src={otherData.photoURL}/>
          <h2>{otherData.name}</h2>
          <p>{utils.formatCurrency(otherData.originalAmount)} credit</p>
        </div>
        <div className="item item-text-wrap center">
          {otherData.sushi}
        </div>
        <div className="item center">
          Updated {this.state.updatedFromNow}
        </div>
        <div className="item tabs tabs-secondary tabs-icon-left">
          <a className="tab-item" href="#" onTouchEnd={this.handleRedeemChange}>
            <i className="icon ion-fork"></i>
            redeem
          </a>
          <a className="tab-item" href="#">
            <i className="icon ion-chatbox"></i>
            chat
          </a>
          <a className="tab-item" href="#" onTouchEnd={this.handleFulfillChange}>
            <i className="icon ion-speedometer"></i>
            fulfill
          </a>
        </div>
      </div>
    );
  }
});

var WalletList = React.createClass({
  render: function(){
    console.log('WalletList.render', this)

    var that = this;

    var walletItemNodes;
    if (!this.props.walletItems) {
      walletItemNodes = (
        <div className="item item-icon-left">
          <i className="icon ion-eye-disabled"></i>
          Nothing to see here.
        </div>
      );
    } else {
      walletItemNodes = [];
      _.forEach(this.props.walletItems, function (balance, key) {
        walletItemNodes.push(
          <BalanceCard key={key} selfUID={that.props.selfUID} balanceID={key} balance={balance} changeScreen={that.props.changeScreen} />
        );
      });
    }

    return (
      <ul className="list">
        {walletItemNodes}
      </ul>
    );
  }
});

var WalletScreen = React.createClass({
  mixins: [ReactFireMixin, ScreenTransitionMixin],
  getInitialState: function(){
    return {
      walletItems: {},
    };
  },
  componentWillMount: function(){
    console.log('WalletScreen.componentWillMount()', this, arguments);

    var balancesRef = this.props.getBalances();

    this.bindAsObject(balancesRef, 'walletItems');
  },
  render: function(){
    console.log('WalletScreen.render()', this, arguments);

    return (
      <div className={classNames.apply(null, this.state.classNames)}>
        <div className="bar-stable bar bar-header nav-bar disable-user-behavior">
          <div className="buttons left-buttons">
            <div>
              <button className="button button-icon icon ion-navicon" onTouchEnd={this.props.showSideMenu}></button>
            </div>
          </div>
          <h1 className="title">My Wallet</h1>
        </div>

        <div className="scroll-content overflow-scroll has-header">

          <WalletList walletItems={this.state.walletItems} selfUID={this.props.selfUID} changeScreen={this.props.changeScreen} />

        </div>
      </div>
    );
  }
});

module.exports = WalletScreen;
