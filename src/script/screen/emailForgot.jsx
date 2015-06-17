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
      message: void 0,
    };
  },
  showLoading: function(){
    this.setState({
      'loading': true,
      'error': void 0,
      'message': void 0,
    });
  },
  onError: function (error) {
    this.setState({
      'error': error,
      'loading': void 0,
    });
  },
  onSuccess: function(){
    this.setState({
      'message': 'Email sent!',
      'loading': void 0,
    });
  },
  handleEmailForgotButton: function(){
    var email = React.findDOMNode(this.refs.emailInput).value;
    console.log('foo', email);
    if (email) {
      this.showLoading();
      this.props.doEmailForgot(email, this.onError, this.onSuccess);
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
          <h1 className="title">Reset Password</h1>
        </div>
        <div className="scroll-content has-header has-footer">
          <div className="padding">
            <p className="center">Please enter the email you used to sign up, and we'll email you a link to reset your password.</p>
            <h4 className="balanced">
              {this.state.message}
            </h4>
            <h4 className="assertive">
              {this.state.error}
            </h4>
          </div>
          <div className="list list-topless">
            <label className="item item-input">
              <input ref="emailInput" type="email" placeholder="Email"/>
            </label>
          </div>
          <div className="padding">
            <button className="button button-block button-assertive" onTouchEnd={this.handleEmailForgotButton}>
              Reset Password
            </button>
          </div>
        </div>
        <div className="bar bar-footer bar-flat">
          <div className="title title-link"><a href="#" onTouchEnd={this.props.handleEmailSignupChange}>Need to create a new account?</a></div>
        </div>
      </div>
    );
  }
});

module.exports = WelcomeScreen;