/** @jsx React.DOM */

var React = require('react/addons');
var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

// Libs
var swipeStack = require('../../lib/swipe-stack-0.1.js');
var sliderInit = function (window, document, btnNext, btnPrev, undefined) {
  'use strict';

  // Feature Test
  if ( 'querySelector' in document && 'addEventListener' in window && Array.prototype.forEach ) {

    // SELECTORS
    var sliders = document.querySelectorAll('[data-slider]');
    var mySwipe = Array;


    // EVENTS, LISTENERS, AND INITS

    // Add class to HTML element to activate conditional CSS
    document.documentElement.className += ' js-slider';

    // Activate all sliders
    Array.prototype.forEach.call(sliders, function (slider, index) {

      // METHODS

      // Handle next button
      var handleNextBtn = function (event) {
        event.preventDefault();
        mySwipe[index].nextRight();
      };

      // Handle previous button
      var handlePrevBtn = function (event) {
        event.preventDefault();
        mySwipe[index].nextLeft();
      };


      // EVENTS, LISTENERS, AND INITS

      // Activate Slider
      mySwipe[index] = swipeStack(slider);

      // Toggle Previous & Next Buttons
      if (btnNext) {
        btnNext.addEventListener('click', handleNextBtn, false);
      }
      if (btnPrev) {
        btnPrev.addEventListener('click', handlePrevBtn, false);
      }
    });
  }
};

// Modules
var pubSub = require('../pubSub.js');

// Mixins
var badgeMixin = require('../mixin/badge.js');

// Components
var SideMenu = require('../component/sideMenu.jsx');

var LocationListItem = React.createClass({
  getInitialState: function(){
    return {
      expanded: false
    };
  },
  render: function() {
    var that = this;

    var handleToggleDetails = function(){
      that.setState({expanded: !that.state.expanded});
    };

    var img = this.props.location.photoURL ? <img src={this.props.location.photoURL}/> : '';

    var skills = this.props.location.skills.map(function (name) {
      return <li>{name}</li>;
    });

    var nominations = this.props.location.nominations.map(function (nomination) {
      return (
        <li>
          <img/>
          <h5>{nomination.name}</h5>
          <span className="skill">{nomination.skill}</span>
          <p>{nomination.text}</p>
        </li>
      );
    });

    return (
      <div onTouchEnd={handleToggleDetails}>
        {img}
        <div className={'summary' + (this.state.expanded ? ' hide' : '')}>
          <div className="nameAndSkillCount">{this.props.location.name}<span className="count icon ion-ios7-bolt"> {this.props.location.skills.length}</span></div>
          <div className="statement">{this.props.location.statement}</div>
        </div>
        <div className={'details' + (this.state.expanded ? ' show' : '')}>
          <div className="nameAndSkillCount">{this.props.location.name}, {this.props.location.age}<span className="count icon ion-ios7-bolt"> {this.props.location.skills.length}</span></div>
          <div className="distance">{this.props.location.distance}</div>
          <div className="location">{this.props.location.location}</div>
          <div className="statement">{this.props.location.statement}</div>
          <div className="skills">
            <h4><span className="icon ion-ios7-bolt"></span> Super Powers:<span className="count">{this.props.location.skills.length}</span></h4>
            <ul>
              {skills}
            </ul>
          </div>
          <div className="nominations">
            <h4><span className="icon ion-ribbon-b"></span> Hero Nominations:<span className="count">{this.props.location.nominations.length}</span></h4>
            <ul>
              {nominations}
            </ul>
          </div>
        </div>
      </div>
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
      return <LocationListItem key={keys[index]} location={location}></LocationListItem>;
    });
    return (
      <div className="content content-main">
        <div className="subhead">
          <h3>{this.props.name}</h3>
        </div>

        <div className="slider" data-slider>
          <div className="slides">
            {locationNodes}
          </div>
        </div>

        <div>
          <h3>Galaxy Explored</h3>
          <p>You've seen all our hero profiles. We'll reach out if you score any mutual matches.</p>
        </div>
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
  componentDidMount: function(){
    var el = this.getDOMNode();
    var btnNext = el.querySelector('[data-slider-nav-next]');
    var btnPrev = el.querySelector('[data-slider-nav-prev]');
    sliderInit(window, document, btnNext, btnPrev);
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
            <h1 className="logo"><span className="dwyer">Upped</span></h1>
            {badge}
          </header>

          <LocationList locations={this.props.locations} checkins={this.state.checkins} filters={this.state.filters} handleLocationChange={this.props.handleLocationChange}></LocationList>

          <div className="bar bar-standard bar-footer round-buttons">
            <a data-slider-nav-prev className="icon icon-close pull-left"></a>
            <button>i</button>
            <a data-slider-nav-next className="icon icon-star-filled pull-right"></a>
          </div>
        </div>

        <SideMenu id="sideMenu" handleActivityChange={this.props.handleActivityChange} handleMyProfileChange={this.props.handleMyProfileChange} handleLogOut={this.props.handleLogOut} />

      </div>
    );
  }
});

module.exports = LocationsScreen;