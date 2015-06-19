var React = require('react');

// Libs
var classNames = require('classnames');

// Mixins
var ScreenTransitionMixin = require('../mixin/screenTransition.js');

var WelcomeScreen = React.createClass({
  mixins: [ScreenTransitionMixin],
  render: function(){
    //console.log('WelcomeScreen.render', this, arguments);

    var error;
    if (this.props.errorMessage) {
      error = (
        <h4 className="assertive">
          {this.props.errorMessage}
        </h4>
      );
    }

    return (
      <div className={classNames.apply(null, this.state.classNames)}>
        <header className="bar bar-header bar-stable">
          <h1 className="title"><span className="logo"></span>Pay With Sushi</h1>
        </header>
        <div className="scroll-content has-header has-footer">
          {error}
          <h2 className="center">
            The Smarter Way to Pay
          </h2>
          <h4 className="center">
            Pay with your goods and services. Track it just like cash.
          </h4>
          <button className="button button-block button-assertive" onTouchEnd={this.props.handleFBLoginButton}>
            Sign Up with Facebook
          </button>
          <button className="button button-block button-assertive" onTouchEnd={this.props.handleEmailSignupChange}>
            Sign Up with Email
          </button>
          <p>By signing up, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.</p>
        </div>
        <div className="bar bar-footer bar-flat">
          <div className="title title-link"><a href="#" onTouchEnd={this.props.handleEmailLoginChange}>Already a member?</a></div>
        </div>
      </div>
    );
  }
});

module.exports = WelcomeScreen;