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
var GatheringListItem = require('../component/gatheringListItem.jsx');

var GatheringList = React.createClass({
  mixins: [SwipeStackSliderMixin],
  componentDidMount: function(){
    var that = this;
    this.swipeStackCallback = function (index, direction) {
      console.log('GatheringList swipeStackCallback', this, arguments, that, that.props.gatherings);

      pubSub.publish('gatherings.currentIndex', {index: index + 1});

      var targetGathering = that.props.gatherings[index];
      var choice = direction === 'left' ? 0 : 1;
      that.props.handleChoice(targetGathering.id, choice);

      if (choice) { // in the future, the user could instead sometimes be waitlisted / etc., if the event is already full or if the organizer wants to hand-pick attendees
        pubSub.publish('gatherings.showMatchOverlay', {match: targetGathering});
      }

      if (index + 1 === that.props.gatherings.length) {
        pubSub.publish('gatherings.hideButtons');
      } else if (that.props.buttonsToTop) {
        pubSub.publish('gatherings.toggleButtons', {expanded: false});
      }
    };

    var el = this.getDOMNode();
    var slider = el.parentNode.querySelector('[data-slider]')
    var btnNext = el.parentNode.querySelector('[data-slider-nav-next]');
    var btnPrev = el.parentNode.querySelector('[data-slider-nav-prev]');
    this.sliderInit(window, document, slider, btnNext, btnPrev);
  },
  render: function() {
    var gatheringNodes = this.props.gatherings.map(function (gathering, index) {
      return <GatheringListItem key={index} gathering={gathering}></GatheringListItem>;
    });

    return (
      <div className="content content-main">
        <div className="subhead">
          <h3>{this.props.name}</h3>
        </div>

        <div className="slider" data-slider>
          <div className="slides">
            {gatheringNodes}
          </div>
        </div>

        <div className="done">
          <h3>Galaxy Explored</h3>
          <p>You’ve seen all upcoming gatherings.</p>
        </div>
      </div>
    );
  }
});

var GatheringsScreen = React.createClass({
  mixins: [ChooseScreenMixin],
  handlePromiseThen: function (gatherings) {
    console.log('GatheringsScreen gatheringsPromise success handlePromiseThen', gatherings, this.props.remote.user.userData.gatherings, this.pendingGatherings);

    var userGatherings = this.props.remote.user.userData.gatherings;

    /*
    window.removeEventListener('getParseGatheringsSuccess', this.handlePromiseThen);
    if (!userGatherings) {
      this.pendingGatherings = gatherings;
      window.addEventListener('getParseGatheringsSuccess', this.handlePromiseThen);
      console.log('GatheringsScreen.handlePromiseThen: Waiting for getParseGatheringsSuccess...');
      return;
    } else if (gatherings instanceof window.Event) {
      gatherings = this.pendingGatherings;
    }
    */

    /*
    gatherings = gatherings.filter(function (gathering) {
      return (
        !_.contains(gatherings.unchosenOnes, gathering.id) && // Don't show gatherings we've already unchosen
        !_.contains(gatherings.chosenOnes, gathering.id) // Don't show gatherings we've already chosen
      );
    });

    gatherings = _.sortBy(gatherings, function (gathering) {
      return !_.contains(gatherings.chosenBy, gathering.id); // Show `chosenBy` gatherings first
    });
    */

    this.setState({
      items: gatherings
    });
  },
  render: function(){
    var that = this;

    var matchOverlay;
    if (this.state.match) {
      matchOverlay = (
        <div className="aMatch">
          <h1>Huzzah!</h1>
          <p>You’re RSVPed!</p>
          <img src={this.state.match.photoURL}/>
          <button className="btn btn-block" onTouchEnd={this.showMatchesScreen}><span className="icon icon-search"></span> Invite</button>
          <button className="btn btn-block" onTouchEnd={this.closeMatchOverlay}><span className="icon icon-person"></span> Keep Exploring</button>
        </div>
      );
    }

    var gatheringList;
    if (this.state.items === void 0) {
      gatheringList = (
        <div className="content content-main">
          <span className="icon ion-loading-d"></span>
        </div>
      );
    } else {
      gatheringList = <GatheringList gatherings={this.state.items} handleChoice={this.props.handleChoice} buttonsToTop={this.state.buttonsToTop}></GatheringList>
    }

    return (
      <div>
        {matchOverlay}

        <header className="bar bar-nav">
          <a className="btn btn-link btn-nav pull-left" onTouchEnd={this.props.handleBack} data-transition="slide-out"><span className="icon icon-bars"></span></a>
          <h1 className="title">Gatherings</h1>
        </header>

        {gatheringList}

        <div className={'round-buttons' + (this.state.hideButtons ? ' hide' : '') + (this.state.buttonsToTop ? ' top' : '')}>
          <a data-slider-nav-prev className="icon icon-button button-no pull-left"></a>
          <button onTouchEnd={this.handleToggleDetails} className="icon icon-button button-info"></button>
          <a data-slider-nav-next className="icon icon-button button-yes pull-right"></a>
        </div>
      </div>
    );
  }
});

module.exports = GatheringsScreen;