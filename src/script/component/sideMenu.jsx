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
      <div id="sideMenu" className="side-menu">
        <div className="content">
          <ul className="table-view">
            {LIs}
            <li className="table-view-cell">
              <a onTouchEnd={function(){ alert('todo!'); }}>
                <h4><span className="icon ion-log-out"></span>Log Out</h4>
              </a>
            </li>
          </ul>
        </div>
      </div>
    );
  }
});

module.exports = SideMenu;