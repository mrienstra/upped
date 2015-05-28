var React = require('react/addons');

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
        screen: 'gatheringsScreen',
        text: 'Gatherings',
        icon: 'ion-search'
      },
      {
        screen: 'heroesScreen',
        text: 'Heroes',
        icon: 'ion-search'
      },
      {
        screen: 'matchesScreen',
        text: 'Matches',
        icon: 'icon-star-filled'
      },
      {
        screen: 'balancesScreen',
        text: 'Balances',
        icon: 'ion-shuffle'
      }
    ];

    var that = this;

    var LIs = menuOptions.map(function (option, i) {
      return (
        <li key={i} className="table-view-cell">
          <a onTouchEnd={that.props.changeScreen.bind(null, option.screen, {state: {fromMenu: true}})}>
            <h4><span className={'icon ' + option.icon}></span>{option.text}</h4>
          </a>
        </li>
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
              <div className="item item-complex">
                <a className="item-content" href="#" onTouchEnd={this.props.hideSideMenu}><span>Balances</span></a>
              </div>
              <div className="item item-complex">
                <a className="item-content" href="#" onTouchEnd={this.props.hideSideMenu}><span>Logout</span></a>
              </div>
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