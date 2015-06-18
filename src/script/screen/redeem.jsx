var React = require('react');

// Libs
var _ = require('lodash');
var classNames = require('classnames');

// Mixins
var ScreenTransitionMixin = require('../mixin/screenTransition.js');

// Modules
var utils = require('../utils');

var RedeemScreen = React.createClass({
  mixins: [ScreenTransitionMixin],
  propTypes: {
    'balance': React.PropTypes.object,
    'handleProfileChange': React.PropTypes.func,
    'handleBack': React.PropTypes.func,
    'selfUID': React.PropTypes.string,
    'visible': React.PropTypes.bool,
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
  render: function(){
    console.log('RedeemScreen.render', this);

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
            <div className="item item-text-wrap leftalign-with-avatar">
              <p className="instructions">To redeem this deal, get in touch with {otherData.name}.</p>
              <button className="button button-small button-assertive" onTouchEnd={this.handleProfileChange}>
                View Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = RedeemScreen;