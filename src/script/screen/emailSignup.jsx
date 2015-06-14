var React = require('react');

// Libs
var classNames = require('classnames');

// Mixins
var ScreenTransitionMixin = require('../mixin/screenTransition.js');

var WelcomeScreen = React.createClass({
  mixins: [ScreenTransitionMixin],
  getInitialState: function() {
    return {
      loading: false,
      error: void 0,
    };
  },
  showLoading: function(){
    this.setState({
      'error': void 0,
      'loading': void 0,
    });
  },
  onError: function (error) {
    this.setState({'error': error});
  },
  handleEmailSignupButton: function(){
    var data = {
      firstName: React.findDOMNode(this.refs.firstnameInput).value,
      lastName: React.findDOMNode(this.refs.lastnameInput).value,
      email: React.findDOMNode(this.refs.emailInput).value,
      password: React.findDOMNode(this.refs.passwordInput).value,
    };
    if (data.firstName && data.lastName && data.email && data.password) {
      this.showLoading();
      this.props.handleEmailSignupButton(data, this.onError);
    }
  },
  render: function(){
    var buttonClasses = 'button button-full button-positive';
    if (this.state.loading) {
      buttonClasses += ' icon-right ion-load-d';
    }

    return (
      <div className={classNames.apply(null, this.state.classNames)}>
        <div className="bar-stable bar bar-header nav-bar disable-user-behavior">
          <div className="button-clear button back-button disable-user-behavior" onTouchEnd={this.props.handleBack}>
            <i className="icon ion-chevron-left"></i> Back
          </div>
          <h1 className="title">SIGN UP</h1>
        </div>
        <div className="scroll-content has-header has-footer">
          <h4 className="assertive">
            {this.state.error}
          </h4>
          <div className="list list-topless">
            <label className="item item-input">
              <input ref="firstnameInput" type="text" inputmode="latin-name" placeholder="First Name"/>
            </label>
            <label className="item item-input">
              <input ref="lastnameInput" type="text" inputmode="latin-name" placeholder="Last Name"/>
            </label>
            <label className="item item-input">
              <input ref="emailInput" type="email" placeholder="Email"/>
            </label>
            <label className="item item-input">
              <input ref="passwordInput" type="password" placeholder="Password"/>
            </label>
          </div>
          <div className="padding">
            <button className="button button-block button-assertive" onTouchEnd={this.handleEmailSignupButton}>
              Sign Up
            </button>
          </div>
        </div>
        <div className="bar bar-footer bar-flat">
          <div className="title title-link"><a href="#" onTouchEnd={this.props.handleEmailLoginChange}>Already a member?</a></div>
        </div>
      </div>
    );
  }
});

module.exports = WelcomeScreen;