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
  handleEmailLoginButton: function(){
    var data = {
      email: React.findDOMNode(this.refs.emailInput).value,
      password: React.findDOMNode(this.refs.passwordInput).value,
    };
    if (data.email && data.password) {
      this.showLoading();
      this.props.doEmailLogin(data, this.onError);
    }
  },
  handleFBLoginButton: function(){
    this.setState({loading: true});
    this.props.handleFBLoginButton();
  },
  render: function(){
    var error;
    if (this.state.error) {
      error = (
        <h4 className="assertive padding">
          {this.state.error}
        </h4>
      );
    }

    return (
      <div className={classNames.apply(null, this.state.classNames)}>
        <div className="bar-stable bar bar-header nav-bar disable-user-behavior">
          <div className="button-clear button back-button disable-user-behavior" onTouchEnd={this.props.handleBack}>
            <i className="icon ion-chevron-left"></i> Back
          </div>
          <h1 className="title">Sign In</h1>
        </div>
        <div className="scroll-content has-header has-footer">
          {error}
          <div className="list list-topless">
            <label className="item item-input">
              <input ref="emailInput" type="email" placeholder="Email"/>
            </label>
            <label className="item item-input">
              <input ref="passwordInput" type="password" placeholder="Password"/>
            </label>
          </div>
          <div className="padding">
            <p className="center"><a href="#" onTouchEnd={this.props.handleEmailForgotChange}>Forgot password?</a></p>
            <button className="button button-block button-assertive" onTouchEnd={this.handleEmailLoginButton}>
              Sign In
            </button>
            <button className="button button-block button-assertive" onTouchEnd={this.handleFBLoginButton}>
              Sign In with Facebook
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