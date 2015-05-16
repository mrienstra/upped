var React = require('react/addons');

// Components
var UserListItem = require('../component/userListItem.jsx');

var ProfileScreen = React.createClass({
  getInitialState: function(){
    return {
      userData: this.props.viewingSelf ? this.props.selfUserData : this.props.userData
    };
  },
  componentWillReceiveProps: function(nextProps) {
    var userData = nextProps.viewingSelf ? nextProps.selfUserData : nextProps.userData;
    this.setState({userData: userData});
  },
  render: function(){
    console.log('ProfileScreen.render', this);

    if (!this.state.userData) {
      return (
        <div className={this.props.visible ? '' : 'hide'}>
          <span className="icon ion-loading-d"></span>
        </div>
      );
    }

    var leftNavButton;
    if (this.props.fromMenu) {
      leftNavButton = <a className="btn btn-link btn-nav pull-left" onTouchEnd={this.props.showSideMenu}><span className="icon icon-bars"></span></a>;
    } else {
      leftNavButton = <a className="btn btn-link btn-nav pull-left" onTouchEnd={this.props.handleBack}><span className="icon icon-left-nav"></span> Back</a>;
    }

    var rightNavButton;
    if (this.props.viewingSelf) {
      rightNavButton = <a className="btn btn-link btn-nav pull-right" onTouchEnd={this.props.handleEdit}>Edit</a>;
    } else if (this.props.matched) {
      rightNavButton = <a className="btn btn-link btn-nav pull-right" onTouchEnd={this.props.handleChatChange.bind(null, {state: {otherUserData: this.state.userData}})}><span className="icon ion-chatbubbles"></span> Chat</a>;
    }
    console.log('rightNavButton', rightNavButton);

    var title;
    if (this.props.viewingSelf) {
      title = 'My Profile';
    } else if (this.state.userData.name) {
      title = this.state.userData.name + '’s Profile';
    } else {
      title ='Profile';
    }

    return (
      <div className={this.props.visible ? '' : 'hide'}>
        <header className="bar bar-nav">
          {leftNavButton}
          {rightNavButton}
          <h1 className="title">{title}</h1>
        </header>

        <div className="content">
          <UserListItem user={this.state.userData} fromMenu={this.props.fromMenu}></UserListItem>;
        </div>

      </div>
    );
  }
});

module.exports = ProfileScreen;