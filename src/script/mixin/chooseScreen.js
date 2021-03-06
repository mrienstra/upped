var React = require('react');

// Libs
var _ = require('lodash');

// Modules
var pubSub = require('../pubSub.js');

var ChooseScreenMixin = {
  getInitialState: function(){
    return {
      buttonsToTop: false,
      hideButtons: false,
      currentIndex: 0,
      items: void 0,
      match: void 0
    };
  },
  componentWillMount: function(){
    console.log('ChooseScreen.componentWillMount', this, arguments);

    var itemsRef = this.props.getItems();
    this.bindAsObject(itemsRef, 'items');

    pubSub.unsubscribe(this.props.pubSubDomain + '.currentIndex', this.updateCurrentIndex);
    pubSub.subscribe(this.props.pubSubDomain + '.currentIndex', this.updateCurrentIndex);

    console.log(this.props.pubSubDomain + '.toggleButtons', this.toggleButtons);
    pubSub.unsubscribe(this.props.pubSubDomain + '.toggleButtons', this.toggleButtons);
    pubSub.subscribe(this.props.pubSubDomain + '.toggleButtons', this.toggleButtons);

    pubSub.unsubscribe(this.props.pubSubDomain + '.hideButtons', this.hideButtons);
    pubSub.subscribe(this.props.pubSubDomain + '.hideButtons', this.hideButtons);
  },
  componentDidMount: function(){
    pubSub.unsubscribe(this.props.pubSubDomain + '.showMatchOverlay', this.showMatchOverlay);
    pubSub.subscribe(this.props.pubSubDomain + '.showMatchOverlay', this.showMatchOverlay);
  },
  hideButtons: function(){
    this.setState({hideButtons: true});
  },
  toggleButtons: function (channel, data) {
    this.setState({buttonsToTop: data.expanded});
  },
  handleToggleDetails: function(){
    pubSub.publish(this.props.pubSubDomain + '.toggleStackListItem.' + this.state.currentIndex);
  },
  updateCurrentIndex: function (channel, data) {
    this.setState({currentIndex: data.index});
  },
  showMatchOverlay: function (channel, data) {
    this.setState({
      match: data.match
    });
  },
  closeOverlays: function (e) {
    if (this.state.firstWant) {
      this.setState({
        firstWant: void 0,
      });
      this.incrementChoiceCount && this.incrementChoiceCount();
    } else if (this.state.match) {
      this.setState({
        match: void 0,
      });
    } else if (this.state.first15Choices) {
      this.setState({
        first15Choices: void 0,
      });
      this.incrementChoiceCount && this.incrementChoiceCount();
    }

    e && e.preventDefault();
  },
  showMatchesScreen: function (e) {
    this.props.handleMatchesChange();
    this.closeMatchOverlay();

    e && e.preventDefault();
  }
};

module.exports = ChooseScreenMixin;