/** @jsx React.DOM */

var React = require('react/addons');
var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

// Libs
var swipeStack = require('../../lib/swipe-stack-0.1.js');
var swipeStackCallback;
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
      mySwipe[index] = swipeStack(slider, {
        callback: swipeStackCallback
      });

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
var UserListItem = require('../component/userListItem.jsx');

var UserList = React.createClass({
  componentWillMount: function(){
    var that = this;
    var i;
    var l;
    var users = this.props.users; /*this.props.users.filter(function (user, index) {
      var choice = {
        count: 0
      };
      if (that.props.choices || that.props.choices.length) {
        that.props.choices.some(function (aChoice) {
          if (aChoice.fbId === user.fbId) {
            choice.count = aChoice.count;
            choice.parseId = aChoice.parseId;
            return true;
          }
        });
      }
      for (i = 0, l = that.props.filters.length; i < l; i++) {
        if (name.indexOf(that.props.filters[i]) === -1) {
          return false;
        }
      }
      return true;
    });*/

    this.setState({users: users});
  },
  componentDidMount: function(){
    var that = this;
    swipeStackCallback = function (index, direction) {
      console.log('UserList swipeStackCallback', this, arguments, that, that.state.users);
      var targetUser = that.state.users[index];
      var choice = direction === 'left' ? 0 : 1;
      that.props.handleChoice(targetUser.id, choice);
    };

    var el = this.getDOMNode();
    var btnNext = el.querySelector('[data-slider-nav-next]');
    var btnPrev = el.querySelector('[data-slider-nav-prev]');
    sliderInit(window, document, btnNext, btnPrev);
  },
  render: function() {
    var userNodes = this.state.users.map(function (user, index) {
      return <UserListItem key={index} user={user}></UserListItem>;
    });

    return (
      <div className="content content-main">
        <div className="subhead">
          <h3>{this.props.name}</h3>
        </div>

        <div className="slider" data-slider>
          <div className="slides">
            {userNodes}
          </div>
        </div>

        <div>
          <h3>Galaxy Explored</h3>
          <p>You've seen all our hero profiles. We'll reach out if you score any mutual matches.</p>
        </div>

        <div className="round-buttons">
            <a data-slider-nav-prev className="icon icon-close pull-left"></a>
            <button>i</button>
            <a data-slider-nav-next className="icon icon-star-filled pull-right"></a>
          </div>
      </div>
    );
  }
});

var ChooseScreen = React.createClass({
  mixins: [badgeMixin],
  getInitialState: function(){
    return {
      users: void 0
    };
  },
  handlePromise: function (usersPromise) {
    var that = this;

    usersPromise.then(
      function (users) {
        console.log('ChooseScreen usersPromise', users);

        that.setState({
          users: users
        });
      },
      function (response) {
        alert('ChooseScreen usersPromise failed!');
        console.warn('bad', response);
      }
    );
  },
  componentWillMount: function(){
    console.log('ChooseScreen.componentWillMount', this, arguments);

    var that = this;

    var usersPromise = this.props.getUsers();

    this.handlePromise(usersPromise);
  },
  render: function(){
    var badge;
    if (this.state.newCount) {
      badge = <div className="status badge badge-negative">{this.state.newCount}</div>;
    }

    var userList;
    if (this.state.users === void 0) {
      userList = (
        <div className="content content-main">
          <span className="icon ion-loading-d"></span>
        </div>
      );
    } else {
      userList = <UserList users={this.state.users} choices={this.props.userChoices} handleChoice={this.props.handleChoice}></UserList>
    }

    return (
      <div>
        <div className="side-menu-siblings-wrapper">
          <header className="bar bar-nav">
            <a className="icon icon-bars pull-left" href="#sideMenu"></a>
            {badge}
          </header>

          {userList}
        </div>

        <SideMenu id="sideMenu" handleMatchesChange={this.props.handleMatchesChange} handleMyProfileChange={this.props.handleMyProfileChange} handleLogOut={this.props.handleLogOut} />

      </div>
    );
  }
});

module.exports = ChooseScreen;