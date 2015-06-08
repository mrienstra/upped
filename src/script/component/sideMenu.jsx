var React = require('react');

// Modules
var pubSub = require('../pubSub.js');

var SideMenu = React.createClass({
  propTypes: {
    changeScreen: React.PropTypes.func.isRequired
  },
  render: function(){
    var menuOptions = [
      {
        screen: 'myProfileScreen',
        text: 'Profile',
        icon: 'ion-person'
      },
      {
        screen: 'creditsScreen',
        text: 'Wallet',
        icon: 'ion-shuffle'
      }
    ];

    var that = this;

    var listItems = menuOptions.map(function (option, i) {
      return (
        <a key={i} className="item item-icon-left" href="#" onTouchEnd={that.props.changeScreen.bind(null, option.screen, {state: {fromMenu: true}})}>
          <i className={'icon ' + option.icon}></i>{option.text}
        </a>
      );
    });

    return (
      <div className="menu menu-left">
        <header className="bar bar-header bar-stable">
          <h1 className="title"><img src="img/new_logo_dark.png"> </img>Pay With Sushi</h1>
        </header>
        <div className="has-header scroll-content">
          <div className="scroll">
            <div className="list disable-user-behavior">
              {listItems}
              <a key={menuOptions.length} className="item item-icon-left" href="#" onTouchEnd={this.props.handleLogOut}>
                <i className="icon ion-log-out"></i>Logout
              </a>
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