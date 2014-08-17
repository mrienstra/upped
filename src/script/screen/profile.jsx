/** @jsx React.DOM */

var React = require('react/addons');

// Components
var UserListItem = require('../component/userListItem.jsx');

var ProfileScreen = React.createClass({
  render: function(){
    console.log('ProfileScreen.render', this);

    var leftNavButton;
    if (this.props.fromMenu) {
      leftNavButton = <a className="btn btn-link btn-nav pull-left" onTouchEnd={this.props.handleBack} data-transition="slide-out"><span className="icon icon-bars"></span></a>;
    } else {
      leftNavButton = <a className="btn btn-link btn-nav pull-left" onTouchEnd={this.props.handleBack} data-transition="slide-out"><span className="icon icon-left-nav"></span> Back</a>;
    }

    var rightNavButton;
    if (this.props.fromMenu) {
      rightNavButton = <a className="btn btn-link btn-nav pull-right" onTouchEnd={function(){alert('Coming Soon');}}>Edit</a>;
    } else {
      rightNavButton = <a className="btn btn-link btn-nav pull-right" onTouchEnd={function(){alert('Coming Soon');}}>Activity</a>;
    }

    var title;
    if (this.props.viewingSelf) {
      title = 'My Profile';
    } else if (this.props.user.name) {
      title = this.state.firstName + '’s Profile';
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
          <UserListItem user={this.props.userData} fromMenu={this.props.fromMenu}></UserListItem>;
        </div>

      </div>
    );
  }
});

module.exports = ProfileScreen;