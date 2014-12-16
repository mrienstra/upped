var React = require('react/addons');

// Libs
var _ = require('lodash');

// Modules
var pubSub = require('../pubSub.js');

var ChooseScreenMixin = {
  getInitialState: function(){
    var pubSubDomain;
    if (this.props.handleGatheringsChange) pubSubDomain = 'heroes';
    else pubSubDomain = 'gatherings';

    return {
      buttonsToTop: false,
      hideButtons: false,
      currentIndex: 0,
      items: void 0,
      match: void 0,
      pubSubDomain: pubSubDomain
    };
  },
  handlePromise: function (itemsPromise) {
    itemsPromise.then(
      this.handlePromiseThen,
      function (response) {
        alert('ChooseScreen itemsPromise failed!');
        console.warn('bad', response);
      }
    );
  },
  componentWillMount: function(){
    console.log('ChooseScreen.componentWillMount', this, arguments);

    var itemsPromise = this.props.getItems();

    this.handlePromise(itemsPromise);

    pubSub.unsubscribe(this.state.pubSubDomain + '.currentIndex', this.updateCurrentIndex);
    pubSub.subscribe(this.state.pubSubDomain + '.currentIndex', this.updateCurrentIndex);

    console.log(this.state.pubSubDomain + '.toggleButtons', this.toggleButtons);
    pubSub.unsubscribe(this.state.pubSubDomain + '.toggleButtons', this.toggleButtons);
    pubSub.subscribe(this.state.pubSubDomain + '.toggleButtons', this.toggleButtons);

    pubSub.unsubscribe(this.state.pubSubDomain + '.hideButtons', this.hideButtons);
    pubSub.subscribe(this.state.pubSubDomain + '.hideButtons', this.hideButtons);
  },
  componentDidMount: function(){
    pubSub.unsubscribe(this.state.pubSubDomain + '.showMatchOverlay', this.showMatchOverlay);
    pubSub.subscribe(this.state.pubSubDomain + '.showMatchOverlay', this.showMatchOverlay);
  },
  hideButtons: function(){
    this.setState({hideButtons: true});
  },
  toggleButtons: function (channel, data) {
    this.setState({buttonsToTop: data.expanded});
  },
  handleToggleDetails: function(){
    pubSub.publish(this.state.pubSubDomain + '.toggleStackListItem.' + this.state.currentIndex);
  },
  updateCurrentIndex: function (channel, data) {
    this.setState({currentIndex: data.index});
  },
  showMatchOverlay: function (channel, data) {
    this.setState({
      match: data.match
    });
  },
  closeMatchOverlay: function (e) {
    this.setState({
      match: void 0
    });

    e && e.preventDefault();
  },
  showMatchesScreen: function (e) {
    this.props.handleMatchesChange();
    this.closeMatchOverlay();

    e && e.preventDefault();
  }
};

module.exports = ChooseScreenMixin;