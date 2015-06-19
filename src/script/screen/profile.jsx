var React = require('react');

// Components
var UserListItem = require('../component/userListItem.jsx');

// Libs
var classNames = require('classnames');

// Mixins
var ReactFireMixin = require('reactfire');
var ScreenTransitionMixin = require('../mixin/screenTransition.js');

var ProfileScreen = React.createClass({
  mixins: [ReactFireMixin, ScreenTransitionMixin],
  getInitialState: function(){
    return {
      userData: void 0,
    };
  },
  initFirebase: function (props) {
    if (props.viewingSelf) {
      this.setState({userData: props.selfUserData});
    } else {
      this.setState({userData: void 0});

      var userData = props.get(props.uid);
      this.bindAsObject(userData, 'userData');
    }
  },
  componentWillMount: function(){
    this.initFirebase(this.props);
  },
  componentWillReceiveProps: function(nextProps) {
    this.initFirebase(nextProps);
  },
  render: function(){
    //console.log('ProfileScreen.render', this);

    if (!this.state.userData) {
      return (
        <div className={classNames.apply(null, this.state.classNames)}>
          <span className="icon ion-loading-d"></span>
        </div>
      );
    }

    var leftNavButton;
    if (this.props.fromMenu) {
      leftNavButton = <button className="button button-icon icon ion-navicon" onTouchEnd={this.props.showSideMenu}></button>;
    } else {
      leftNavButton = <button className="button button-icon icon ion-chevron-left" onTouchEnd={this.props.handleBack}></button>;
    }

    var rightNavButton;
    if (this.props.viewingSelf) {
      //rightNavButton = <button className="button button-icon icon ion-edit" onTouchEnd={this.props.handleEdit}></button>;
    } else if (this.props.matched) {
      rightNavButton = <button className="button button-icon icon ion-chatbubbles" onTouchEnd={this.props.handleChatChange.bind(null, {state: {otherUserData: this.state.userData}})}></button>;
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
      <div className={classNames.apply(null, this.state.classNames)}>
        <div className="bar-stable bar bar-header nav-bar disable-user-behavior">
          <div className="buttons left-buttons">
            <div>
              {leftNavButton}
            </div>
          </div>
          <h1 className="title">{title}</h1>
            <div className="buttons left-buttons">
              <div>
                {rightNavButton}
              </div>
            </div>
        </div>

        <div className="scroll-content overflow-scroll has-header">
          <UserListItem user={this.state.userData} fromMenu={this.props.fromMenu}></UserListItem>
        </div>
      </div>
    );
  }
});

module.exports = ProfileScreen;