/** @jsx React.DOM */

var React = require('react/addons');

// Components
var UserListItem = require('../component/userListItem.jsx');

// Modules
var pubSub = require('../pubSub.js');

var ProfileScreen = React.createClass({
  getInitialState: function(){
    return {
      userData: this.props.userData
    }
  },
  componentDidMount: function(){
    pubSub.unsubscribe('profileModified.self', this.updateUserData);
    pubSub.subscribe('profileModified.self', this.updateUserData);
  },
  updateUserData: function (channel, data) {
    console.log('ProfileScreen.updateUserData', data.userData);
    this.setState({userData: data.userData});
  },
  render: function(){
    console.log('ProfileScreen.render', this);

    var leftNavButton;
    if (this.props.fromMenu) {
      leftNavButton = <a className="btn btn-link btn-nav pull-left" onTouchEnd={this.props.handleBack} data-transition="slide-out"><span className="icon icon-bars"></span></a>;
    } else {
      leftNavButton = <a className="btn btn-link btn-nav pull-left" onTouchEnd={this.props.handleBack} data-transition="slide-out"><span className="icon icon-left-nav"></span> Back</a>;
    }

    var rightNavButton;
    if (this.props.viewingSelf) {
      rightNavButton = <a className="btn btn-link btn-nav pull-right" onTouchEnd={this.props.handleEdit}>Edit</a>;
    }

    var title;
    if (this.props.viewingSelf) {
      title = 'My Profile';
    } else if (this.state.userData.name) {
      title = this.state.userData.name + '’s Profile';
    } else {
      title ='Profile';
    }

    return (
      <div>
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