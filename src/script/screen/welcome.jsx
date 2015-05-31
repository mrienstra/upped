var React = require('react');

var WelcomeScreen = React.createClass({
  getInitialState: function() {
    return {
      loading: false
    };
  },
  handleLoginButton: function(){
    this.setState({loading: true});
    this.props.handleLoginButton();
  },
  render: function(){
    var buttonClasses = 'button button-full button-positive';
    if (this.state.loading) {
      buttonClasses += ' icon-right ion-load-d';
    }

    return (
      <div className="welcome pane">
        <header className="bar bar-header bar-stable">
          <h1 className="title"><img src="img/new_logo_dark.png"> </img>Pay With Sushi</h1>
        </header>
        <div className="scroll-content has-header has-footer padding">
          <h1>Welcome to Pay with Sushi!</h1>
          <h3>What’s your sushi?</h3>
        </div>
        <div className="bar bar-footer">
          <button className={buttonClasses} onTouchEnd={this.handleLoginButton}>Log In with Facebook</button>
        </div>
      </div>
    );
  }
});

module.exports = WelcomeScreen;