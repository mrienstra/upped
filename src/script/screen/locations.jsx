/** @jsx React.DOM */

var React = require('react/addons');

var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

var LocationListItem = React.createClass({
  render: function() {
    return (
      <li className="table-view-cell media">
        <a className="navigate-right" onTouchEnd={this.props.handleLocationChange.bind(null, this.props)} data-transition="slide-in">
          <div className="media-body">
            <h4>{this.props.name}</h4>
            <p>{this.props.checkedInCount ? this.props.checkedInCount + ' checked in, ' : ''}{this.props.distance}</p>
          </div>
        </a>
      </li>
    );
  }
});

var LocationList = React.createClass({
  render: function() {
    var i;
    var l;
    var that = this;
    var keys = [];
    var locations = this.props.locations.filter(function (location, index) {
      var name = location.name.toLowerCase();
      for (i = 0, l = that.props.filters.length; i < l; i++) {
        if (name.indexOf(that.props.filters[i]) === -1) {
          return false;
        }
      }
      keys.push(index);
      return true;
    });
    var locationNodes = locations.map(function (location, index) {
      return <LocationListItem key={keys[index]} name={location.name} fbId={location.fbId} checkedInCount={location.checkedInCount} address1={location.address1} address2={location.address2} promotion={location.promotion} distance={location.distance} handleLocationChange={that.props.handleLocationChange}></LocationListItem>;
    });
    return (
      <div className="content content-main">
        <div className="subhead">
          <h3>{this.props.name}</h3>
        </div>

        <ul className="table-view">
          <ReactCSSTransitionGroup transitionName="list-item">
            {locationNodes}
          </ReactCSSTransitionGroup>
        </ul>
      </div>
    );
  }
});

var LocationsScreen = React.createClass({
  getInitialState: function() {
    return {filters: []};
  },
  handleFilterChange: function (event) {
    console.log('handleFilterChange', event);
    this.setState({filters: event.target.value.toLowerCase().split(' ')});
  },
  render: function(){
    return (
      <div>
        <div className="side-menu-siblings-wrapper">
          <header className="bar bar-nav">
            <a className="icon icon-bars pull-left" href="#sideMenu"></a>
            <a className="icon ion-log-in pull-right" href="#todo"></a>
            <h1 className="logo"><span className="dwyer">BarChat</span></h1>
            <div className="status badge badge-negative">1</div>
          </header>

          <div className="bar bar-standard bar-header-secondary">
            <form>
              <input type="search" onChange={this.handleFilterChange} placeholder="Search" />
            </form>
          </div>

          <LocationList locations={this.props.locations} filters={this.state.filters} handleLocationChange={this.props.handleLocationChange}></LocationList>
        </div>

        <div id="sideMenu" className="side-menu">
          <div className="content">
            <ul className="table-view">
              <li className="table-view-cell selected">
                <a href="bar-detail.html" data-transition="slide-in">
                  <h4><span className="icon ion-log-in"></span> Check In</h4>
                </a>
              </li>
              <li className="table-view-cell">
                <a href="bar-detail.html" data-transition="slide-in">
                  <h4><span className="icon ion-person"></span> Profile</h4>
                </a>
              </li>
              <li className="table-view-cell">
                <a href="bar-detail.html" data-transition="slide-in">
                  <h4><span className="icon ion-paper-airplane"></span> Gifts</h4>
                  <div className="status badge badge-negative">1</div>
                </a>
              </li>
              <li className="table-view-cell">
                <a href="bar-detail.html" data-transition="slide-in">
                  <h4><span className="icon ion-gear-a"></span> Settings</h4>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = LocationsScreen;