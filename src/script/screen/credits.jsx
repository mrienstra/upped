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

var UserListItemCompact = React.createClass({
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
  componentWillMount: function(){
    this.updateFromNow();

    this.setInterval(this.updateFromNow, 5 * 1000);
  },
  componentWillReceiveProps: function (nextProps) {
    this.updateFromNow(nextProps.balance);
  },
  render: function() {
    var balance = this.props.balance;

    /*
    created
    currentAmount
    originalAmount
    provider
      name
      photoURL
    providerID
    receiver
      name
      photoURL
    receiverID
    sushi
    updated
    */

    var remainingDIV;
    if (balance.currentAmount === 0) {
      remainingDIV = (
        <div>
          <h3>DONE!</h3>
        </div>
      );
    } else {
      remainingDIV = (
        <div>
          <h3>{utils.formatCurrency(balance.currentAmount)}</h3>
          remaining
        </div>
      );
    }

    return (
      <a className="item item-avatar item-icon-right" href="#" onTouchEnd={this.props.handleBalanceChange.bind(null, {state: {balance: balance, balanceID: this.props.balanceID, selfRole: this.props.selfRole}})}>
        <img src={(this.props.selfRole === 'provider') ? balance.receiver.photoURL : balance.provider.photoURL} />

        <span className="item-note remaining">
          {remainingDIV}
        </span>

        <h2>{(this.props.selfRole === 'provider') ? balance.receiver.name : balance.provider.name}</h2>
        <p>{utils.formatCurrency(balance.originalAmount)} credit for {balance.sushi}</p>
        <p>Last active {this.state.updatedFromNow}</p>

        <i className="icon ion-ios-arrow-forward"></i>
      </a>
    );
  }
});

var CreditsList = React.createClass({
  render: function(){
    console.log('CreditsList.render', this)

    var that = this;

    var creditNodes;
    if (!this.props.credits) {
      creditNodes = (
        <div className="item item-icon-left">
          <i className="icon ion-eye-disabled"></i>
          Nothing to see here.
        </div>
      );
    } else {
      creditNodes = [];
      _.forEach(this.props.credits, function (balance, key) {
        creditNodes.push(
          <UserListItemCompact key={key} selfRole="receiver" balanceID={key} balance={balance} handleBalanceChange={that.props.handleBalanceChange} />
        );
      });
    }

    return (
      <ul className="list">
        {creditNodes}
      </ul>
    );
  }
});

var CreditsScreen = React.createClass({
  mixins: [ReactFireMixin, ScreenTransitionMixin],
  getInitialState: function(){
    return {
      credits: {},
    };
  },
  componentWillMount: function(){
    console.log('CreditsScreen.componentWillMount()', this, arguments);

    var creditsRef = this.props.getBalances();

    this.bindAsObject(creditsRef, 'credits');
  },
  render: function(){
    console.log('CreditsScreen.render()', this, arguments);

    return (
      <div className={classNames.apply(null, this.state.classNames)}>
        <div className="bar-stable bar bar-header nav-bar disable-user-behavior">
          <div className="buttons left-buttons">
            <div>
              <button className="button button-icon icon ion-navicon" onTouchEnd={this.props.showSideMenu}></button>
            </div>
          </div>
          <h1 className="title">My Credits</h1>
        </div>

        <div className="scroll-content has-header">

          <CreditsList credits={this.state.credits} handleBalanceChange={this.props.handleBalanceChange} />

        </div>
      </div>
    );
  }
});

module.exports = CreditsScreen;
