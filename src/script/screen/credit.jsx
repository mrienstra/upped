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

var CreditScreen = React.createClass({
  mixins: [ReactFireMixin, ScreenTransitionMixin, SetIntervalMixin],
  propTypes: {
    'addNote': React.PropTypes.func,
    'balance': React.PropTypes.object,
    'get': React.PropTypes.func,
    'getHistory': React.PropTypes.func,
    'handleBack': React.PropTypes.func,
    'selfUID': React.PropTypes.string,
    'visible': React.PropTypes.bool,
  },
  getInitialState: function(){
    return {
      createdFromNow: void 0,
      updatedFromNow: void 0,
      history: void 0,
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
    console.log('CreditScreen.componentWillMount()', this, arguments);

    this.initFirebase(this.props);

    this.updateFromNow();

    this.setInterval(this.updateFromNow, 5 * 1000);
  },
  componentWillReceiveProps: function (nextProps) {
    this.initFirebase(nextProps);

    this.updateFromNow(nextProps.balance);
  },
  handleNotesChange: function (event) {
    var value = event.target.value;
    this.setState({notesValue: value});
  },
  handleNoteSubmit: function(){
    console.log('handleNoteSubmit', this, arguments);

    var notes = this.state.notesValue.trim();

    if (notes) {
      this.props.addNote(this.props.balanceID, void 0, void 0, notes);

      this.setState({
        notesValue: '',
      });

      _.defer(this.updateFromNow);
    }
  },
  render: function(){
    console.log('CreditScreen.render', this);

    var balance = this.state.balance || this.props.balance;

    if (!balance) {
      return (
        <div className={classNames.apply(null, this.state.classNames)}>
          <div className="bar-stable bar bar-header nav-bar disable-user-behavior">
            <div className="button-clear button back-button disable-user-behavior" onTouchEnd={this.props.handleBack}>
              <i className="icon ion-chevron-left"></i> Back
            </div>
            <h1 className="title">Credit</h1>
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

    var remainingDIV;
    if (otherData.currentAmount === 0) {
      remainingDIV = (
        <div>
          <h3>DONE!</h3>
        </div>
      );
    } else {
      remainingDIV = (
        <div>
          <h3>{utils.formatCurrency(otherData.currentAmount)}</h3>
          remaining
        </div>
      );
    }

    var historyNodes = [];
    _.forIn(this.state.history, function (history, key) {
      historyNodes.push(
        <HistoryListItem key={key} history={history} name={balance[history.uid + '_data'].name} photoURL={balance[history.uid + '_data'].photoURL} />
      );
    });
    historyNodes.reverse();

    return (
      <div className={classNames.apply(null, this.state.classNames)}>
        <div className="bar-stable bar bar-header nav-bar disable-user-behavior">
          <div className="button-clear button back-button disable-user-behavior" onTouchEnd={this.props.handleBack}>
            <i className="icon ion-chevron-left"></i> Back
          </div>
          <h1 className="title">Credit</h1>
        </div>

        <div className="scroll-content overflow-scroll has-header wallet-card">

          <span className="remaining">
            {remainingDIV}
          </span>

          <img className="avatar" src={otherData.photoURL} />

          <h2>{otherData.name}</h2>

          <div className="row">
            <div className="col">
              <h4 className="icon-left ion-arrow-shrink">You Get</h4>
              <p className="sushi">{otherData.sushi}</p>
              <p>{utils.formatCurrency(otherData.currentAmount)} remaining</p>
              <button className="button button-energized icon-right ion-arrow-right-b">
                Redeem
              </button>
            </div>
            <div className="col">
              <h4 className="icon-left ion-arrow-expand">You Pay</h4>
              <p className="sushi">{selfData.sushi}</p>
              <p>{utils.formatCurrency(selfData.currentAmount)} remaining</p>
              <button className="button button-energized icon-right ion-arrow-right-b">
                Deduct
              </button>
            </div>
          </div>

          <div className="list padding-top">
            {historyNodes}
          </div>

        </div>
      </div>
    );
  }
});

module.exports = CreditScreen;