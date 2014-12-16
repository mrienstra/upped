var React = require('react/addons');

// Modules
var pubSub = require('../pubSub.js');

var SideMenu = React.createClass({
  propTypes: {
    handleMatchesChange: React.PropTypes.func.isRequired,
    handleBack: React.PropTypes.func, // Not required
    handleGatheringsChange: React.PropTypes.func.isRequired,
    handleMyProfileChange: React.PropTypes.func.isRequired,
    handleLogOut: React.PropTypes.func.isRequired,
    id: React.PropTypes.string.isRequired
  },
  render: function(){
    return (
      <div id={this.props.id} className="side-menu">
        <div className="content">
          <ul className="table-view">
            <li className="table-view-cell">
              <a onTouchEnd={this.props.handleMyProfileChange}>
                <h4><span className="icon ion-person"></span>Profile</h4>
              </a>
            </li>
            <li className="table-view-cell">
              <a onTouchEnd={this.props.handleGatheringsChange}>
                <h4><span className="icon ion-search"></span>Gatherings</h4>
              </a>
            </li>
            <li className="table-view-cell">
              <a href={'#' + this.props.id} onTouchEnd={this.props.handleBack}>
                <h4><span className="icon ion-search"></span>Heroes</h4>
              </a>
            </li>
            <li className="table-view-cell">
              <a className="activity" onTouchEnd={this.props.handleMatchesChange.bind(null, true)}>
                <h4><span className="icon icon-star-filled"></span>Matches</h4>
              </a>
            </li>
            <li className="table-view-cell">
              <a onTouchEnd={this.props.handleLogOut}>
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