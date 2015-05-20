var React = require('react/addons');

// Libs
var _ = require('lodash');

// Mixins
var ScreenTransitionMixin = require('../mixin/screenTransition.js');

// Modules
var utils = require('../utils');

var UserListItemCompact = React.createClass({
  render: function() {
    var balance = this.props.balance;

    /*
    balance
      current
      original
    created
    provider
    receiver
    sushi
    updated
    otherUserData
      id
      age
      distance
      linkedinURL
      location
      name
      nominations
      photoURL
      skills
      statement
    */

    var img = (balance.otherUserData && balance.otherUserData.photoURL) ? <img src={balance.otherUserData.photoURL}/> : '';

    var createdFromNow = utils.momentFromNowIfTime(balance.created);
    var updatedFromNow = utils.momentFromNowIfTime(balance.updated);

    return (
      <li className="table-view-cell">
        <a>
          {img}
          <h4>{balance.otherUserData && balance.otherUserData.name}: {balance.sushi}</h4>
          <p>${(balance.balance.current === balance.balance.original) ? balance.balance.original : balance.balance.current + ' remaining of $' + balance.balance.original}</p>
          <p>Last updated {updatedFromNow}, started {createdFromNow}</p>
        </a>
      </li>
    );
  }
});

var BalancesList = React.createClass({
  processBalances: function (props) { // Todo: Move to remote? Promises?
    var that = this;

    var newState = {
      'providerBalances': [],
      'receiverBalances': [],
    };


    _.forEach(newState, function (n, key) {
      var modifiedBalances = props[key].map(function (balance) {
        var otherUserDataId = (key === 'providerBalances') ? balance.receiver : balance.provider;
        var modifiedBalance = _.clone(balance);
        modifiedBalance.otherUserData = _.find(props.allUserData, {id: otherUserDataId});
        return modifiedBalance;
      });

      newState[key] = modifiedBalances;
    });

    console.log('BalancesList.processBalances', props, newState);

    that.setState(newState);
  },
  componentWillMount: function(){
    this.processBalances(this.props);
  },
  componentWillReceiveProps: function (nextProps) {
    this.processBalances(nextProps);
  },
  render: function(){
    console.log('BalancesList.render', this)

    var providerBalanceNodes;
    if (!this.state.providerBalances || this.state.providerBalances.length === 0) {
      providerBalanceNodes = (
        <li className="table-view-cell"><p><span className="icon ion-eye-disabled"></span> Nothing to see here.</p></li>
      );
    } else {
      providerBalanceNodes = this.state.providerBalances.map(function (balance, index) {
        return <UserListItemCompact key={index} balance={balance} />;
      });
    }

    var receiverBalanceNodes;
    if (!this.state.receiverBalances || this.state.receiverBalances.length === 0) {
      receiverBalanceNodes = (
        <li className="table-view-cell"><p><span className="icon ion-eye-disabled"></span> Nothing to see here.</p></li>
      );
    } else {
      receiverBalanceNodes = this.state.receiverBalances.map(function (balance, index) {
        return <UserListItemCompact key={index} balance={balance} />;
      });
    }

    return (
      <ul className="table-view balances-list">
        <li className="table-view-divider">
          <h4><span className="icon ion-arrow-expand"></span> Providing</h4>
        </li>
        {providerBalanceNodes}
        <li className="table-view-divider">
          <h4><span className="icon ion-arrow-shrink"></span> Receiving</h4>
        </li>
        {receiverBalanceNodes}
      </ul>
    );
  }
});

var BalancesScreen = React.createClass({
  mixins: [ReactFireMixin, ScreenTransitionMixin],
  getInitialState: function(){
    return {
      providerBalances: [],
      receiverBalances: [],
    };
  },
  componentWillMount: function(){
    console.log('BalancesScreen.componentWillMount()', this, arguments);

    var balances = this.props.getBalances();

    this.bindAsArray(balances.providerRef, 'providerBalances');
    this.bindAsArray(balances.receiverRef, 'receiverBalances');
  },
  render: function(){
    console.log('BalancesScreen.render()', this, arguments);

    var leftNavButton;
    if (this.props.fromMenu) {
      leftNavButton = <a className="btn btn-link btn-nav pull-left" onTouchEnd={this.props.showSideMenu}><span className="icon icon-bars"></span></a>;
    } else {
      leftNavButton = <a className="btn btn-link btn-nav pull-left" onTouchEnd={this.props.handleBack}><span className="icon icon-left-nav"></span> Back</a>;
    }

    return (
      <div className={React.addons.classSet.apply(null, this.state.classNames)}>
        <header className="bar bar-nav solid">
          {leftNavButton}
          <h1 className="title">Balances</h1>
        </header>

        <div className="content">

          <BalancesList providerBalances={this.state.providerBalances} receiverBalances={this.state.receiverBalances} allUserData={this.props.allUserData} />

        </div>
      </div>
    );
  }
});

module.exports = BalancesScreen;
