/** @jsx React.DOM */

var React = require('react/addons');

var SideMenu = React.createClass({
  render: function(){
    return (
      <div className="content">
        <ul className="table-view">
          <li className="table-view-cell">
            <a>
              <h4><span className="icon ion-ios7-location"></span>Bars</h4>
            </a>
          </li>
          <li className="table-view-cell">
            <a onTouchEnd={this.props.handleProfileChange}>
              <h4><span className="icon ion-person"></span>Profile</h4>
            </a>
          </li>
          <li className="table-view-cell">
            <a className="activity">
              <h4><span className="icon ion-star"></span>Activity</h4>
              <div className="status badge badge-negative">1</div>
            </a>
          </li>
          <li className="table-view-cell hide">
            <a>
              <h4><span className="icon ion-gear-a"></span>Settings</h4>
            </a>
          </li>
          <li className="table-view-cell">
            <a onTouchEnd={this.props.handleLogOut}>
              <h4><span className="icon ion-log-out"></span>Log Out</h4>
            </a>
          </li>
        </ul>
      </div>
    );
  }
});

module.exports = SideMenu;

