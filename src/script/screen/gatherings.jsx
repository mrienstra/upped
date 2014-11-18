/** @jsx React.DOM */

var React = require('react/addons');
var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

// Libs
var _ = require('lodash');

// Mixins
var swipeStackSlider = require('../mixin/swipeStackSlider.js');

// Modules
var pubSub = require('../pubSub.js');

// Components
var SideMenu = require('../component/sideMenu.jsx');
var GatheringListItem = require('../component/gatheringListItem.jsx');

var GatheringList = React.createClass({
  mixins: [swipeStackSlider],
  componentDidMount: function(){
    var that = this;
    this.swipeStackCallback = function (index, direction) {
      console.log('GatheringList swipeStackCallback', this, arguments, that, that.props.gatherings);

      pubSub.publish('gatheringList.current', {index: index + 1});

      var targetGathering = that.props.gatherings[index];
      var gathering = direction === 'left' ? 0 : 1;

      if (index + 1 === that.props.gatherings.length) {
        pubSub.publish('gatherings.hideButtons');
      } else if (that.props.buttonsToTop) {
        pubSub.publish('gatherings.toggleButtons', {expanded: false});
        that.handleSliderUnpause();
      }
    };

    var el = this.getDOMNode();
    var btnNext = el.parentNode.querySelector('[data-slider-nav-next]');
    var btnPrev = el.parentNode.querySelector('[data-slider-nav-prev]');
    this.sliderInit(window, document, btnNext, btnPrev);
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
  getInitialState: function(){
    return {
      buttonsToTop: false,
      hideButtons: false,
      currentIndex: 0,
      gatherings: void 0
    };
  },
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
      gatherings: gatherings
    });
  },
  handlePromise: function (gatheringsPromise) {
    gatheringsPromise.then(
      this.handlePromiseThen,
      function (response) {
        alert('GatheringsScreen gatheringsPromise failed!');
        console.warn('bad', response);
      }
    );
  },
  componentWillMount: function(){
    console.log('GatheringsScreen.componentWillMount', this, arguments);

    var that = this;

    var gatheringsPromise = this.props.getGatherings();

    this.handlePromise(gatheringsPromise);

    pubSub.unsubscribe('gatheringList.current', this.updateCurrentIndex);
    pubSub.subscribe('gatheringList.current', this.updateCurrentIndex);

    pubSub.unsubscribe('gatherings.toggleButtons', this.toggleButtons);
    pubSub.subscribe('gatherings.toggleButtons', this.toggleButtons);

    pubSub.unsubscribe('gatherings.hideButtons', this.hideButtons);
    pubSub.subscribe('gatherings.hideButtons', this.hideButtons);
  },
  hideButtons: function(){
    this.setState({hideButtons: true});
  },
  toggleButtons: function (channel, data) {
    this.setState({buttonsToTop: data.expanded});
    if (data.expanded) {
      this.handleSliderPause();
    } else {
      this.handleSliderUnpause();
    }
  },
  updateCurrentIndex: function (channel, data) {
    this.setState({currentIndex: data.index});
  },
  render: function(){
    var that = this;

    var gatheringList;
    if (this.state.gatherings === void 0) {
      gatheringList = (
        <div className="content content-main">
          <span className="icon ion-loading-d"></span>
        </div>
      );
    } else {
      gatheringList = <GatheringList gatherings={this.state.gatherings} handleChoice={this.props.handleChoice} buttonsToTop={this.state.buttonsToTop}></GatheringList>
    }

    var handleToggleDetails = function(){
      pubSub.publish('gatherings.toggleStackListItem.' + that.state.currentIndex);
    };

    return (
      <div>
        <header className="bar bar-nav">
          <a className="btn btn-link btn-nav pull-left" onTouchEnd={this.props.handleBack} data-transition="slide-out"><span className="icon icon-bars"></span></a>
          <h1 className="title">Gatherings</h1>
        </header>

        {gatheringList}

        <div className={'round-buttons' + (this.state.hideButtons ? ' hide' : '') + (this.state.buttonsToTop ? ' top' : '')}>
          <a data-slider-nav-prev className="icon icon-button button-no pull-left"></a>
          <button onTouchEnd={handleToggleDetails} className="icon icon-button button-info"></button>
          <a data-slider-nav-next className="icon icon-button button-yes pull-right"></a>
        </div>
      </div>
    );
  }
});

module.exports = GatheringsScreen;