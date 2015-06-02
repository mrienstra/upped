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
      createdFromNow: void 0,
      updatedFromNow: void 0,
    };
  },
  updateFromNow: function (balance) {
    var createdFromNow, updatedFromNow;

    if (!balance && !this.props.balance)
     return;

    if (!balance)
      balance = this.props.balance;

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

    this.setState({
      createdFromNow: createdFromNow,
      updatedFromNow: updatedFromNow,
    });
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

    return (
      <a className="item item-avatar" href="#" onTouchEnd={this.props.handleBalanceChange.bind(null, {state: {balance: balance, balanceID: this.props.balanceID, selfRole: this.props.selfRole}})}>
        <img src={(this.props.selfRole === 'provider') ? balance.receiver.photoURL : balance.provider.photoURL} />
        <h2>{(this.props.selfRole === 'provider') ? balance.receiver.name : balance.provider.name}: {balance.sushi}</h2>
        <p>{(balance.currentAmount === balance.originalAmount) ? utils.formatCurrency(balance.originalAmount) : utils.formatCurrency(balance.currentAmount) + ' remaining of ' + utils.formatCurrency(balance.originalAmount)}</p>
        <p>Last updated {this.state.updatedFromNow}, started {this.state.createdFromNow}</p>
      </a>
    );
  }
});

var DebitsList = React.createClass({
  render: function(){
    console.log('DebitsList.render', this)

    var that = this;

    var debitNodes;
    if (!this.props.debits) {
      debitNodes = (
        <div className="item item-icon-left">
          <i className="icon ion-eye-disabled"></i>
          Nothing to see here.
        </div>
      );
    } else {
      debitNodes = [];
      _.forEach(this.props.debits, function (balance, key) {
        debitNodes.push(
          <UserListItemCompact key={key} selfRole="provider" balanceID={key} balance={balance} handleBalanceChange={that.props.handleBalanceChange} />
        );
      });
    }

    return (
      <ul className="list">
        {debitNodes}
      </ul>
    );
  }
});

var DebitsScreen = React.createClass({
  mixins: [ReactFireMixin, ScreenTransitionMixin],
  getInitialState: function(){
    return {
      debits: {},
    };
  },
  componentWillMount: function(){
    console.log('DebitsScreen.componentWillMount()', this, arguments);

    var debitsRef = this.props.getBalances();

    this.bindAsObject(debitsRef, 'debits');
  },
  render: function(){
    console.log('DebitsScreen.render()', this, arguments);

    return (
      <div className={classNames.apply(null, this.state.classNames)}>
        <div className="bar-stable bar bar-header nav-bar disable-user-behavior">
          <div className="buttons left-buttons">
            <div>
              <button className="button button-icon icon ion-navicon" onTouchEnd={this.props.showSideMenu}></button>
            </div>
          </div>
          <h1 className="title">Debits</h1>
        </div>

        <div className="scroll-content has-header">

          <DebitsList debits={this.state.debits} handleBalanceChange={this.props.handleBalanceChange} />

        </div>
      </div>
    );
  }
});

module.exports = DebitsScreen;
