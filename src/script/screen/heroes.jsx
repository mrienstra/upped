/** @jsx React.DOM */

var React = require('react/addons');

// Libs
var _ = require('lodash');

// Mixins
var ChooseScreenMixin = require('../mixin/chooseScreen.js');
var SwipeStackSliderMixin = require('../mixin/swipeStackSlider.js');

// Modules
var pubSub = require('../pubSub.js');

// Components
var SideMenu = require('../component/sideMenu.jsx');
var UserListItem = require('../component/userListItem.jsx');

var UserList = React.createClass({
  mixins: [SwipeStackSliderMixin],
  componentDidMount: function(){
    var that = this;
    this.swipeStackCallback = function (index, direction) {
      console.log('UserList swipeStackCallback', this, arguments, that, that.props.users);

      pubSub.publish('heroes.currentIndex', {index: index + 1});

      var targetUser = that.props.users[index];
      var choice = direction === 'left' ? 0 : 1;
      var match = that.props.handleChoice(targetUser.id, choice);

      if (match) {
        console.log('UserList swipeStackCallback match', match);

        pubSub.publish('heroes.showMatchOverlay', {match: match});
      }

      if (index + 1 === that.props.users.length) {
        pubSub.publish('heroes.hideButtons');
      } else if (that.props.buttonsToTop) {
        pubSub.publish('heroes.toggleButtons', {expanded: false});
      }
    };

    var el = this.getDOMNode();
    var btnNext = el.parentNode.querySelector('[data-slider-nav-next]');
    var btnPrev = el.parentNode.querySelector('[data-slider-nav-prev]');
    this.sliderInit(window, document, btnNext, btnPrev);
  },
  render: function() {
    var userNodes = this.props.users.map(function (user, index) {
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

        <div className="done">
          <h3>Galaxy Explored</h3>
          <p>You’ve seen all our hero profiles. We’ll reach out if you score any mutual matches.</p>
        </div>
      </div>
    );
  }
});

var HeroesScreen = React.createClass({
  mixins: [ChooseScreenMixin],
  handlePromiseThen: function (users) {
    console.log('HeroesScreen usersPromise success handlePromiseThen', users, this.props.remote.choices, this.pendingUsers);

    var choices = this.props.remote.choices;

    window.removeEventListener('getParseChoicesSuccess', this.handlePromiseThen);
    if (!choices) {
      this.pendingUsers = users;
      window.addEventListener('getParseChoicesSuccess', this.handlePromiseThen);
      console.log('HeroesScreen.handlePromiseThen: Waiting for getParseChoicesSuccess...');
      return;
    } else if (users  instanceof window.Event) {
      users = this.pendingUsers;
    }

    users = users.filter(function (user) {
      return (
        !_.contains(choices.unchosenOnes, user.id) && // Don't show people we've already unchosen
        !_.contains(choices.chosenOnes, user.id) // Don't show people we've already chosen
      );
    });

    users = _.sortBy(users, function (user) {
      return !_.contains(choices.chosenBy, user.id); // Show `chosenBy` people first
    });

    this.setState({
      items: users
    });
  },
  render: function(){
    var that = this;

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

    var userList;
    if (this.state.items === void 0) {
      userList = (
        <div className="content content-main">
          <span className="icon ion-loading-d"></span>
        </div>
      );
    } else {
      userList = <UserList users={this.state.items} handleChoice={this.props.handleChoice} buttonsToTop={this.state.buttonsToTop}></UserList>
    }

    return (
      <div className="heroes">
        <div className="side-menu-siblings-wrapper">
          {matchOverlay}

          <header className="bar bar-nav">
            <a className="icon icon-bars pull-left" href="#sideMenu"></a>
          </header>

          <div className="loadingOverlay">
            <p><span className="icon ion-ios7-reloading"></span></p>
          </div>

          {userList}

          <div className={'round-buttons' + (this.state.hideButtons ? ' hide' : '') + (this.state.buttonsToTop ? ' top' : '')}>
            <a data-slider-nav-prev className="icon icon-button button-no pull-left"></a>
            <button onTouchEnd={this.handleToggleDetails} className="icon icon-button button-info"></button>
            <a data-slider-nav-next className="icon icon-button button-yes pull-right"></a>
          </div>
        </div>

        <SideMenu id="sideMenu" handleMatchesChange={this.props.handleMatchesChange} handleMyProfileChange={this.props.handleMyProfileChange} handleGatheringsChange={this.props.handleGatheringsChange} handleLogOut={this.props.handleLogOut} />

      </div>
    );
  }
});

module.exports = HeroesScreen;