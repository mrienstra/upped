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
      email: React.findDOMNode(this.refs.emailInput).value,
      password: React.findDOMNode(this.refs.passwordInput).value,
    };
    if (data.email && data.password) {
      this.showLoading();
      this.props.handleEmailSignupButton(data, this.onError);
    }
  },
  render: function(){
    var error;
    if (this.state.error) {
      error = (
        <h4 className="assertive">
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
          <h1 className="title">Sign Up</h1>
        </div>
        <div className="scroll-content has-header has-footer">
          {error}
          <div className="list list-topless">
            <label className="item item-input">
              <input ref="emailInput" type="email" placeholder="Email" disabled={!this.props.visible}/>
            </label>
            <label className="item item-input">
              <input ref="passwordInput" type="password" placeholder="Password" disabled={!this.props.visible}/>
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