/** @jsx React.DOM */

var React = require('react/addons');
var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

// Libs
var _ = require('lodash');
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

// Components
var SideMenu = require('../component/sideMenu.jsx');
var UserListItem = require('../component/userListItem.jsx');

var UserList = React.createClass({
  getInitialState: function(){
    return {
      match: void 0
    };
  },
  componentDidMount: function(){
    var that = this;
    swipeStackCallback = function (index, direction) {
      console.log('UserList swipeStackCallback', this, arguments, that, that.props.users);

      pubSub.publish('userlist.current', {index: index});

      var targetUser = that.props.users[index];
      var choice = direction === 'left' ? 0 : 1;
      var match = that.props.handleChoice(targetUser.id, choice);

      if (match) {
        console.log('UserList swipeStackCallback match', match);

        that.setState({
          match: match
        });
      }

      if (that.props.buttonsToTop) pubSub.publish('toggleButtons');
    };

    var el = this.getDOMNode();
    var btnNext = el.parentNode.querySelector('[data-slider-nav-next]');
    var btnPrev = el.parentNode.querySelector('[data-slider-nav-prev]');
    sliderInit(window, document, btnNext, btnPrev);
  },
  closeMatchOverlay: function (e) {
    this.setState({
      match: void 0
    });

    e && e.preventDefault();
  },
  showMatchesScreen: function (e) {
    this.props.showMatchesScreen();
    this.closeMatchOverlay();

    e && e.preventDefault();
  },
  render: function() {
    var matchOverlay;
    if (this.state.match) {
      matchOverlay = (
        <div className="aMatch">
          <h1>A Match!</h1>
          <p>You’ve matched with {this.state.match.name}!</p>
          <img src={this.state.match.photoURL}/>
          <button className="btn btn-block" onTouchEnd={this.showMatchesScreen}><span className="icon icon-search"></span> Show Matches</button>
          <button className="btn btn-block" onTouchEnd={this.closeMatchOverlay}><span className="icon icon-person"></span> Keep Exploring</button>
        </div>
      );
    }

    var userNodes = this.props.users.map(function (user, index) {
      return <UserListItem key={index} user={user}></UserListItem>;
    });

    return (
      <div className="content content-main">
        {matchOverlay}

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
          <p>You’ve seen all our hero profiles. We’ll reach out if you score any mutual matches.</p>
        </div>
      </div>
    );
  }
});

var ChooseScreen = React.createClass({
  getInitialState: function(){
    return {
      buttonsToTop: false,
      currentIndex: 0,
      users: void 0
    };
  },
  handlePromise: function (usersPromise) {
    var that = this;

    usersPromise.then(
      function (users) {
        console.log('ChooseScreen usersPromise success', users, that.props.remote.choices);

        var choices = that.props.remote.choices;

        users = users.filter(function (user) {
          return (
            !_.contains(choices.unchosenOnes, user.id) && // Don't show people we've already unchosen
            !_.contains(choices.chosenOnes, user.id) // Don't show people we've already chosen
          );
        });

        users = _.sortBy(users, function (user) {
          return !_.contains(choices.chosenBy, user.id); // Show `chosenBy` people first
        });

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

    pubSub.unsubscribe('userlist.current', this.updateCurrentIndex);
    pubSub.subscribe('userlist.current', this.updateCurrentIndex);

    pubSub.unsubscribe('toggleButtons', this.toggleButtons);
    pubSub.subscribe('toggleButtons', this.toggleButtons);

  },
  toggleButtons: function(){
    this.setState({buttonsToTop: !this.state.buttonsToTop});
  },
  updateCurrentIndex: function (channel, data) {
    this.setState({currentIndex: data.index});
  },
  render: function(){
    var that = this;

    var userList;
    if (this.state.users === void 0) {
      userList = (
        <div className="content content-main">
          <span className="icon ion-loading-d"></span>
        </div>
      );
    } else {
      userList = <UserList users={this.state.users} handleChoice={this.props.handleChoice} buttonsToTop={this.state.buttonsToTop} showMatchesScreen={this.props.handleMatchesChange}></UserList>
    }

    var handleToggleDetails = function(){
      pubSub.publish('toggleDataUserListItem.' + that.state.currentIndex);
    };

    return (
      <div>
        <div className="side-menu-siblings-wrapper">
          <header className="bar bar-nav">
            <a className="icon icon-bars pull-left" href="#sideMenu"></a>
          </header>

          {userList}

          <div className={'round-buttons' + (this.state.buttonsToTop ? ' top' : '')}>
            <a data-slider-nav-prev className="icon icon-button button-no pull-left"></a>
            <button onTouchEnd={handleToggleDetails} className="button-info"></button>
            <a data-slider-nav-next className="icon icon-button button-yes pull-right"></a>
          </div>
        </div>

        <SideMenu id="sideMenu" handleMatchesChange={this.props.handleMatchesChange} handleMyProfileChange={this.props.handleMyProfileChange} handleLogOut={this.props.handleLogOut} />

      </div>
    );
  }
});

module.exports = ChooseScreen;