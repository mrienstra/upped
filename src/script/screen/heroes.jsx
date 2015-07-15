var React = require('react');

// Libs
var _ = require('lodash');
var classNames = require('classnames');

// Mixins
var ChooseScreenMixin = require('../mixin/chooseScreen.js');
var ReactFireMixin = require('reactfire');
var ScreenTransitionMixin = require('../mixin/screenTransition.js');
var SwipeStackSliderMixin = require('../mixin/swipeStackSlider.js');

// Modules
var pubSub = require('../pubSub.js');

// Components
var UserListItem = require('../component/userListItem.jsx');

var UserList = React.createClass({
  mixins: [SwipeStackSliderMixin],
  propTypes: {
    'buttonsToTop': React.PropTypes.bool,
    'handleChoice': React.PropTypes.func,
    'name': React.PropTypes.string,
    'users': React.PropTypes.object,
  },
  getInitialState: function(){
    return {
      imagesToLoad: 2,
    };
  },
  componentDidMount: function(){
    var that = this;
    this.swipeStackCallback = function (index, direction) {
      console.log('UserList swipeStackCallback', this, arguments, that, that.props.users);

      pubSub.publish('heroes.currentIndex', {index: index + 1});

      that.setState({imagesToLoad: that.state.imagesToLoad + 1});

      var targetUser = that.props.users[that.keys[index]];
      var choice = direction === 'left' ? 0 : 1;
      var match = that.props.handleChoice(targetUser.id || targetUser.textID, choice);

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
    var slider = el.parentNode.querySelector('[data-slider]')
    var btnNext = el.parentNode.querySelector('[data-slider-nav-next]');
    var btnPrev = el.parentNode.querySelector('[data-slider-nav-prev]');
    this.sliderInit(window, document, slider, btnNext, btnPrev);
  },
  componentWillReceiveProps: function (nextProps) {
    if (this.props.buttonsToTop && !nextProps.buttonsToTop) {
      React.findDOMNode(this.refs.scrollable).scrollTop = 0;
    }
  },
  render: function() {
    var that = this;
    var userNodes = [];
    this.keys = [];
    var i = 0;
    _.forEach(this.props.users, function (user, key) {
      that.keys.push(key);
      var delayImageLoad = i >= that.state.imagesToLoad ? true : false;
      userNodes.push(
        <UserListItem key={key} index={key} user={user} phrase={that.props.phrase} delayImageLoad={delayImageLoad}></UserListItem>
      );
      i++;
    });

    return (
      <div className="slider" data-slider>
        <div ref="scrollable" className="slides">
          {userNodes}
        </div>
      </div>
    );
  }
});

var HeroesScreen = React.createClass({
  mixins: [ReactFireMixin, ChooseScreenMixin, ScreenTransitionMixin],
  propTypes: {
    remote: React.PropTypes.object.isRequired,
    getItems: React.PropTypes.func.isRequired, // for mixin
    handleChoice: React.PropTypes.func.isRequired, // passed into `UserList`
    handleMatchesChange: React.PropTypes.func.isRequired, // for mixin
    showSideMenu: React.PropTypes.func.isRequired,
    visible: React.PropTypes.bool.isRequired
  },
  render: function(){
    var that = this;

    var theseClassNames = ['heroes'].concat(this.state.classNames);
    if (this.state.buttonsToTop) theseClassNames.push('buttonsToTop');

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
      userList = <UserList users={this.state.items} phrase={this.props.phrase} handleChoice={this.props.handleChoice} buttonsToTop={this.state.buttonsToTop}></UserList>
    }

    return (
      <div className={classNames.apply(null, theseClassNames)}>
        <div className="bar-stable bar bar-header nav-bar disable-user-behavior">
          <div className="buttons left-buttons">
            <div>
              <button className="button button-icon icon ion-navicon" onTouchEnd={this.props.showSideMenu}></button>
            </div>
          </div>
          <h1 className="title">Discover</h1>
            <div className="buttons right-buttons">
              <div>
                <button data-slider-nav-prev className="button button-icon icon ion-close"></button>
                <button data-slider-nav-next className="button button-icon icon ion-heart"></button>
              </div>
            </div>
        </div>

        <div className="scroll-content overflow-scroll has-header">
          {matchOverlay}

          <div className="loadingOverlay">
            <p><span className="icon ion-ios7-reloading"></span></p>
          </div>

          {userList}

          <div className="done">
            <h3>Profiles Explored</h3>
            <p>You’ve seen all our profiles in your area. We’ll reach out if you score any mutual matches.</p>
          </div>
        </div>

        <div ref="footer" className="bar bar-footer bar-stable">
          <button data-slider-nav-prev className="button button-icon icon ion-close"></button>
          <button onTouchEnd={this.handleToggleDetails} className="button button-clear" style={{margin: "0 auto"}}>More</button>
          <button data-slider-nav-next className="button button-icon icon ion-heart"></button>
        </div>
      </div>
    );
  }
});

module.exports = HeroesScreen;