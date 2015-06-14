var React = require('react');

// Libs
var classNames = require('classnames');

// Mixins
var ScreenTransitionMixin = require('../mixin/screenTransition.js');

var ResetPasswordScreen = React.createClass({
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
  handleResetPasswordButton: function(){
    var newPassword = React.findDOMNode(this.refs.newPasswordInput).value;
    var newPasswordConfirm = React.findDOMNode(this.refs.newPasswordConfirmInput).value;
    if (newPassword !== newPasswordConfirm) {
      this.setState({'error': 'Passwords do not match'});
    } else if (newPassword) {
      this.showLoading();
      this.props.doResetPassword(newPassword, this.onError);
    }
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
          <h1 className="title">RESET PASSWORD</h1>
        </div>
        <div className="scroll-content has-header">
          {error}
          <div className="list list-topless">
            <label className="item item-input">
              <input ref="newPasswordInput" type="password" placeholder="New Password"/>
            </label>
            <label className="item item-input">
              <input ref="newPasswordConfirmInput" type="password" placeholder="Confirm New Password"/>
            </label>
          </div>
          <div className="padding">
            <button className="button button-block button-assertive" onTouchEnd={this.handleResetPasswordButton}>
              Reset Password
            </button>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = ResetPasswordScreen;