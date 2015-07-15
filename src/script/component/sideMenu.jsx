var React = require('react');

// Modules
var pubSub = require('../pubSub.js');

var SideMenu = React.createClass({
  propTypes: {
    changeScreen: React.PropTypes.func.isRequired,
    handleLogOut: React.PropTypes.func,
    items: React.PropTypes.array.isRequired,
  },
  render: function(){

    var that = this;

    var listItems = this.props.items.map(function (option, i) {
      return (
        <a key={i} className="item item-icon-left" href="#" onTouchEnd={that.props.changeScreen.bind(null, option.screen, {state: {fromMenu: true}})}>
          <i className={'icon ' + option.icon}></i>{option.text}
        </a>
      );
    });

    var logout;
    if (this.props.handleLogOut) {
      logout = (
        <a key={menuOptions.length} className="item item-icon-left" href="#" onTouchEnd={this.props.handleLogOut}>
          <i className="icon ion-android-exit"></i>Logout
        </a>
      );
    }

    return (
      <div className="menu menu-left">
        <header className="bar bar-header bar-stable">
          <h1 className="title"><span className="logo"></span>Pay With Sushi</h1>
        </header>
        <div className="has-header scroll-content">
          <div className="scroll">
            <div className="list disable-user-behavior">
              {listItems}
              {logout}
            </div>
          </div>
          <div className="scroll-bar scroll-bar-v">
              <div className="scroll-bar-indicator scroll-bar-fade-out"></div>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = SideMenu;