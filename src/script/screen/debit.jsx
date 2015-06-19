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
var SetIntervalMixin = require('../../lib/set-interval-mixin.jsx');

// Modules
var utils = require('../utils');

var DebitScreen = React.createClass({
  mixins: [ReactFireMixin, ScreenTransitionMixin, SetIntervalMixin],
  propTypes: {
    'balance': React.PropTypes.object,
    'deductAndOrAddNote': React.PropTypes.func,
    'get': React.PropTypes.func,
    'getHistory': React.PropTypes.func,
    'handleBack': React.PropTypes.func,
    'visible': React.PropTypes.bool,
  },
  getInitialState: function(){
    return {
      createdFromNow: void 0,
      updatedFromNow: void 0,
      history: void 0,
      amountValue: void 0,
      notesValue: void 0,
    };
  },
  initFirebase: function (props) {
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
    //console.log('DebitScreen.componentWillMount()', this, arguments);

    this.initFirebase(this.props);

    this.updateFromNow();

    this.setInterval(this.updateFromNow, 5 * 1000);
  },
  componentWillReceiveProps: function (nextProps) {
    this.initFirebase(nextProps);

    this.updateFromNow(nextProps.balance);
  },
  handleAmountChange: function (event) {
    var value = event.target.value;
    this.setState({amountValue: value});
  },
  handleNotesChange: function (event) {
    var value = event.target.value;
    this.setState({notesValue: value});
  },
  handleDeductAndOrNoteSubmit: function(){
    //console.log('handleDeductAndOrNoteSubmit', this, arguments);

    var amount = parseFloat(this.state.amountValue);

    var notes = this.state.notesValue || void 0;

    if (!this.state.amountValue && notes !== void 0) {
      this.props.deductAndOrAddNote(this.props.balanceID, void 0, void 0, notes);

      this.setState({
        notesValue: '',
      });

      _.defer(this.updateFromNow);
    } else if (amount > 0 && amount <= this.props.balance.currentAmount) {
      this.props.deductAndOrAddNote(this.props.balanceID, this.props.balance.currentAmount, amount, notes);

      this.setState({
        amountValue: '',
        notesValue: '',
      });

      _.defer(this.updateFromNow);
    }
  },
  render: function(){
    //console.log('DebitScreen.render', this);

    var balance = this.state.balance || this.props.balance;

    if (!balance) {
      return (
        <div className={classNames.apply(null, this.state.classNames)}>
          <div className="bar-stable bar bar-header nav-bar disable-user-behavior">
            <div className="button-clear button back-button disable-user-behavior" onTouchEnd={this.props.handleBack}>
              <i className="icon ion-chevron-left"></i> Back
            </div>
            <h1 className="title">Debit</h1>
          </div>

          <div className="scroll-content has-header">

          </div>
        </div>
      );
    }

    var historyNodes = [];
    _.forIn(this.state.history, function (history, key) {
      var name = (history.uid === balance.providerID) ? balance.provider.name : balance.receiver.name;
      var photoURL = (history.uid === balance.providerID) ? balance.provider.photoURL : balance.receiver.photoURL;
      historyNodes.push(
        <HistoryListItem key={key} history={history} name={name} photoURL={photoURL} />
      );
    });
    historyNodes.reverse();

    return (
      <div className={classNames.apply(null, this.state.classNames)}>
        <div className="bar-stable bar bar-header nav-bar disable-user-behavior">
          <div className="button-clear button back-button disable-user-behavior" onTouchEnd={this.props.handleBack}>
            <i className="icon ion-chevron-left"></i> Back
          </div>
          <h1 className="title">Debit</h1>
        </div>

        <div className="scroll-content overflow-scroll has-header">

          <div className="list card">

            <div className="item item-avatar">
              <img src={(this.props.selfRole === 'provider') ? this.props.balance.receiver.photoURL : this.props.balance.provider.photoURL} />
              <h2>{(this.props.selfRole === 'provider') ? balance.receiver.name : balance.provider.name}: {balance.sushi}</h2>
                <p>{(balance.currentAmount === balance.originalAmount) ? utils.formatCurrency(balance.originalAmount) : utils.formatCurrency(balance.currentAmount) + ' remaining of ' + utils.formatCurrency(balance.originalAmount)}</p>

            </div>

            <div className="item item-body">
              <p className="subdued">Last updated {this.state.updatedFromNow}, started {this.state.createdFromNow}</p>

              <div className="list">
                <label className="item item-input">
                  <span className="input">$ </span>
                  <input type="text" placeholder=" Amount to deduct (optional)" value={this.state.amountValue} onChange={this.handleAmountChange} />
                </label>
                <label className="item item-input">
                  <input type="text" placeholder="Notes (optional)" value={this.state.notesValue} onChange={this.handleNotesChange} />
                </label>
                <div className="item">
                  <button className="button button-block button-positive" onTouchEnd={this.handleDeductAndOrNoteSubmit}>
                    Deduct and/or Add Note
                  </button>
                </div>
              </div>
            </div>

            {historyNodes}

          </div>

        </div>
      </div>
    );
  }
});

module.exports = DebitScreen;