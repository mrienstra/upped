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

    var cornerRibbon, remainingDIV;
    if (otherData.currentAmount === 0) {
      remainingDIV = (
        <div>
          <h3>DONE!</h3>
        </div>
      );
    } else {
      cornerRibbon = (
        <span className="corner-ribbon">
          Open
        </span>
      );
      remainingDIV = (
        <div>
          <h3>{utils.formatCurrency(otherData.currentAmount)}</h3>
          remaining
        </div>
      );
    }

    return (
      <div className="card wallet-card">
        <div className="item item-text-wrap">
          {cornerRibbon}

          <span className="remaining">
            {remainingDIV}
          </span>

          <img className="avatar" src={otherData.photoURL} />

          <h2>{otherData.name}</h2>
          <p className="sushi">{otherData.sushi}</p>
          <p className="sushi">Paying with {selfData.sushi}</p>
          <p>Last active {this.state.updatedFromNow}{(selfData.unread) ? ', ' + selfData.unread + ' unread' : ''}</p>

          <button className="button button-small button-energized icon-right ion-arrow-right-b" onTouchEnd={this.props.handleBalanceChange.bind(null, {state: {balance: balance, balanceID: this.props.balanceID, selfUID: this.props.selfUID}})}>
            Details
          </button>
        </div>
      </div>
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
          <BalanceCard key={key} selfUID={that.props.selfUID} balanceID={key} balance={balance} handleBalanceChange={that.props.handleBalanceChange} />
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
          <h1 className="title">My Wallet</h1>
        </div>

        <div className="scroll-content overflow-scroll has-header">

          <CreditsList credits={this.state.credits} selfUID={this.props.selfUID} handleBalanceChange={this.props.handleBalanceChange} />

        </div>
      </div>
    );
  }
});

module.exports = CreditsScreen;
