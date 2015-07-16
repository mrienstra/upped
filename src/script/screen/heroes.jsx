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
      currentIndex: 0,
    };
  },
  componentDidMount: function(){
    var that = this;
    this.swipeStackCallback = function (index, direction) {
      console.log('UserList swipeStackCallback', this, arguments, that, that.props.users);

      pubSub.publish('heroes.currentIndex', {index: index + 1});
      that.setState({currentIndex: index + 1});

      var targetUser = that.props.users[that.keys[index]];
      var choice = direction === 'left' ? 0 : 1;
      var match = that.props.handleChoice(targetUser.id || targetUser.textID, choice);

      if (match) {
        console.log('UserList swipeStackCallback match', match);

        pubSub.publish('heroes.showMatchOverlay', {match: match});
      } else if (choice === 1) {
        that.props.showFirstWantOverlay({name: targetUser.name});
      }

      if (index + 1 === that.props.users.length) {
        pubSub.publish('heroes.hideButtons');
      } else if (that.props.buttonsToTop) {
        pubSub.publish('heroes.toggleButtons', {expanded: false});
      }

      that.props.incrementChoiceCount();
    };

    var el = this.getDOMNode();
    var slider = el.parentNode.querySelector('[data-slider]')
    var btnNext = el.parentNode.querySelector('[data-slider-nav-next]');
    var btnPrev = el.parentNode.querySelector('[data-slider-nav-prev]');
    this.sliderInit(window, document, slider, this.props.noButtons, this.props.yesButtons);
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
      var delayImageLoad = !!(i >= (that.state.currentIndex + 2));
      userNodes.push(
        <UserListItem key={key} index={key} user={user} phrase={that.props.phrase} delayImageLoad={delayImageLoad} buttonsToTop={that.props.buttonsToTop} proposedAmount={150} contentTop={that.props.contentTop} isFrontmost={i === that.state.currentIndex}></UserListItem>
      );
      i++;
      //if (i > 5) return false;
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
    handleHowChange: React.PropTypes.func.isRequired,
    handleMatchesChange: React.PropTypes.func.isRequired, // for mixin
    showSideMenu: React.PropTypes.func.isRequired,
    visible: React.PropTypes.bool.isRequired
  },
  getInitialState: function(){
    return {
      fullyRendered: false,
      firstWant: void 0,
      noButtons: void 0,
      yesButtons: void 0,
      choiceCount: 1,
    };
  },
  showFirstWantOverlay: function (firstWant) {
    this.setState({firstWant: firstWant});
    this.showFirstWantOverlay = function(){};
  },
  incrementChoiceCount: function(){
    this.setState({choiceCount: this.state.choiceCount + 1});
  },
  componentDidMount: function(){
    var that = this;
    _.defer(function(){
      that.setState({
        'contentTop':  React.findDOMNode(that.refs.contentArea).getBoundingClientRect().top,
        'noButtons': [
          React.findDOMNode(that.refs.buttonNoTop),
          React.findDOMNode(that.refs.buttonNoBottom),
        ],
        'yesButtons': [
          React.findDOMNode(that.refs.buttonYesTop),
          React.findDOMNode(that.refs.buttonYesBottom),
        ],
      });
    });
  },
  render: function(){
    var that = this;

    var theseClassNames = ['heroes'].concat(this.state.classNames);
    if (this.state.buttonsToTop) theseClassNames.push('buttonsToTop');

    var choiceCount;
    if (this.state.choiceCount && this.state.choiceCount <= 15) {
      choiceCount = (
        <div className="choiceCount">{this.state.choiceCount} of 15</div>
      );
    }

    var done;
    if (this.state.fullyRendered) {
      done = (
        <div className="done">
          <h3>Profiles Explored</h3>
          <p>You’ve seen all our profiles in your area. We’ll reach out if you score any mutual matches.</p>
        </div>
      );
    }

    var overlay;
    //this.state.firstWant = {name: 'Reiki Healing with Kim'};
    if (this.state.firstWant) {
      overlay = (
        <div className="overlay card">
          <div className="item item-text-wrap">
            <h1>Great news!<br/>You&#8217;re on a roll.</h1>
            <p>You&#8217;ve made your first want on Pay with Sushi. We&#8217;ll reach out to <b>{this.state.firstWant.name}</b>, and let you know when they respond. For now, keep exploring&hellip;</p>
            <p><a href="#" onTouchEnd={this.props.handleHowChange}>How this works »</a></p>
            <button className="button button-block button-assertive" onTouchEnd={this.closeOverlays}>Keep Exploring Offers</button>
          </div>
        </div>
      );
    } else if (this.state.match) {
      overlay = (
        <div className="aMatch">
          <h1>A Match!</h1>
          <p>You’ve matched with {this.state.match.name}!</p>
          <img src={this.state.match.photoURL}/>
          <button className="btn btn-block" onTouchEnd={this.showMatchesScreen}><span className="icon icon-search"></span> Show Matches</button>
          <button className="btn btn-block" onTouchEnd={this.closeOverlays}><span className="icon icon-person"></span> Keep Exploring</button>
        </div>
      );
    }

    var userList;
    if (this.state.items === void 0) {
      userList = (
        <div className="loadingOverlay">
          <p><span className="icon ion-load-b"></span></p>
        </div>
      );
    } else {
      userList = <UserList users={this.state.items} phrase={this.props.phrase} handleChoice={this.props.handleChoice} buttonsToTop={this.state.buttonsToTop} showFirstWantOverlay={this.showFirstWantOverlay} noButtons={this.state.noButtons} yesButtons={this.state.yesButtons} incrementChoiceCount={this.incrementChoiceCount} contentTop={this.state.contentTop}></UserList>

      _.delay(function(){
        that.setState({fullyRendered: true});
      }, 1000);
    }

    return (
      <div className={classNames.apply(null, theseClassNames)}>
        <div className="bar-stable bar bar-header nav-bar disable-user-behavior">
          <div className="buttons left-buttons">
            <div>
              <button className="button button-icon icon ion-navicon" onTouchEnd={this.props.showSideMenu}></button>
            </div>
          </div>
          <h1 className="title">Offers for You</h1>
          <div className="buttons right-buttons">
            <div>
              <button ref="buttonNoTop" className="button button-icon icon ion-close"></button>
              <button ref="buttonYesTop" className="button button-icon icon ion-heart want-button"></button>
            </div>
          </div>
          {choiceCount}
        </div>

        <div ref="contentArea" className="scroll-content overflow-scroll has-header">
          {done}

          {userList}

          {overlay}
        </div>

        <div ref="footer" className="bar bar-footer bar-stable">
          <button ref="buttonNoBottom" className="button button-icon icon ion-close"></button>
          <button onTouchEnd={this.handleToggleDetails} className="button button-clear" style={{margin: "0 auto"}}>More</button>
          <button ref="buttonYesBottom" className="button button-icon icon ion-heart want-button"></button>
        </div>
      </div>
    );
  }
});

module.exports = HeroesScreen;