/** @jsx React.DOM */

var React = require('react/addons');
var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

// Modules
var pubSub = require('../pubSub.js');

// Mixins
var badgeMixin = require('../mixin/badge.js');

// Components
var SideMenu = require('../component/sideMenu.jsx');

var LocationListItem = React.createClass({
  render: function() {
    return (
      <li className="table-view-cell media">
        <a className="navigate-right" onTouchEnd={this.props.handleLocationChange.bind(null, this.props)} data-transition="slide-in">
          <div className="media-body">
            <h4>{this.props.name}</h4>
            <p>{this.props.checkin.count ? this.props.checkin.count : 0} checked in, {this.props.distance}</p>
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
      var checkin = {
        count: 0
      };
      if (that.props.checkins || that.props.checkins.length) {
        that.props.checkins.some(function (aCheckin) {
          if (aCheckin.fbId === location.fbId) {
            checkin.count = aCheckin.count;
            checkin.parseId = aCheckin.parseId;
            return true;
          }
        });
      }
      return <LocationListItem key={keys[index]} name={location.name} fbId={location.fbId} photoURL={location.photoURL} checkin={checkin} address1={location.address1} address2={location.address2} promotion={location.promotion} distance={location.distance} handleLocationChange={that.props.handleLocationChange}></LocationListItem>;
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
  mixins: [badgeMixin],
  getInitialState: function(){
    return {
      checkins: [],
      filters: []
    };
  },
  handleFilterChange: function (event) {
    console.log('handleFilterChange', event);
    this.setState({filters: event.target.value.toLowerCase().split(' ')});
  },
  handlePromise: function (checkinsPromise) {
    var that = this;

    checkinsPromise.then(
      function (checkins) {
        console.log('LocationsScreen checkinsPromise', checkins);

        that.setState({
          checkins: checkins
        });
      },
      function (response) {
        alert('LocationsScreen checkinsPromise failed!');
        console.warn('bad', response);
      }
    );
  },
  componentWillMount: function(){
    console.log('LocationsScreen.componentWillMount', this, arguments);

    var that = this;

    var checkinsPromise = this.props.getCheckins();

    this.handlePromise(checkinsPromise);

    pubSub.subscribe('location', function (topic, data) {
      console.log('LocationsScreen.componentWillMount pubSub.subscribe "location"', this, arguments);

      var outstandingChanges = data.previousFbId ? 2 : 1;

      console.log('outstandingChanges', outstandingChanges)

      var newCheckins = that.state.checkins.concat();
      if (newCheckins.some(function (checkin, i) {
        if (checkin.fbId === data.fbId) {
          newCheckins[i].count += data.checkedIn ? 1 : -1;

          if (!--outstandingChanges) return true;
        } else if (data.previousFbId && checkin.fbId === data.previousFbId) {
          newCheckins[i].count -= 1;

          if (!--outstandingChanges) return true;
        }
      })) {
        console.log('newCheckins', newCheckins)
        that.setState({checkins: newCheckins});
      } else {
        console.error('todo: update when new?');
      }
    });
  },
  render: function(){
    var badge;
    if (this.state.newCount) {
      badge = <div className="status badge badge-negative">{this.state.newCount}</div>;
    }

    return (
      <div>
        <div className="side-menu-siblings-wrapper">
          <header className="bar bar-nav">
            <a className="icon icon-bars pull-left" href="#sideMenu"></a>
            <a className="icon ion-search pull-right" href="#todo"></a>
            <h1 className="logo"><span className="dwyer">BarChat</span></h1>
            {badge}
          </header>

          <div className="bar bar-standard bar-header-secondary">
            <form>
              <input type="search" onChange={this.handleFilterChange} placeholder="Search" />
            </form>
          </div>

          <LocationList locations={this.props.locations} checkins={this.state.checkins} filters={this.state.filters} handleLocationChange={this.props.handleLocationChange}></LocationList>
        </div>

        <SideMenu id="sideMenu" handleActivityChange={this.props.handleActivityChange} handleMyProfileChange={this.props.handleMyProfileChange} handleLogOut={this.props.handleLogOut} />

      </div>
    );
  }
});

module.exports = LocationsScreen;