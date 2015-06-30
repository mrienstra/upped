// Libs
var _ = require('lodash');

var lastModifiedState, lastPreviousScreen, nextTransitionClasses;

var ScreensMixin = {
  getInitialState: function(){
    return {
      transitionClasses: '',
    };
  },
  changeScreen: function (newScreen, options) {
    var back = !!(options && options.back);

    var previousScreen = this.state.screens.stack[this.state.screens.i];

    var modifiedState = {};

    var transition = false;

    var that = this;

    if (back) {
      newScreen = this.state.screens.stack[this.state.screens.i - 1];
    } else if (newScreen === 'myProfileScreen') {
      newScreen = 'profileScreen';
      options = {state: {fromMenu: true, matched: false, userData: void 0, viewingSelf: true}};
    }

    if (newScreen === previousScreen) {
      // No need to change screens...
      if (this.state.sideMenuVisible) {
        // ... but hide the sideMenu if it's visible
        modifiedState.sideMenuVisible = false;
        this.setState(modifiedState);
      }

      return;
    }

    modifiedState[previousScreen] = this.state[previousScreen];

    modifiedState[newScreen] = this.state[newScreen];
    modifiedState[newScreen].visible = true;
    if (options && options.state)
      _.assign(modifiedState[newScreen], options.state);

    if (back) {
      // Simple "back"
      modifiedState.screens = {
        stack: this.state.screens.stack,
        i: this.state.screens.i - 1
      };

      modifiedState.transitionClasses = ' rs-showRight rs-notransition';
      nextTransitionClasses = ' rs-showCenter rs-transition';
      modifiedState[previousScreen].transition = {type: 'depart', direction: 'right'};
      modifiedState[newScreen].transition = {type: 'arrive', direction: 'left'};
      transition = true;

      ga('send', 'event', 'navigation', 'back to ' + newScreen);
    } else if (options && options.state && options.state.fromMenu) {
      // Clear stack
      modifiedState.screens = {
        stack: [newScreen],
        i: 0
      };

      modifiedState[previousScreen].visible = false;

      ga('send', 'event', 'navigation', 'fromMenu to ' + newScreen);
    } else if (this.state.screens.stack.length > this.state.screens.i + 1) {
      // Discard "forward" stack
      modifiedState.screens = {
        stack: this.state.screens.stack.concat().splice(0, this.state.screens.i + 1).concat(newScreen),
        i: this.state.screens.i + 1
      };

      modifiedState.transitionClasses = ' rs-showLeft rs-notransition';
      nextTransitionClasses = ' rs-showCenter rs-transition';
      modifiedState[previousScreen].transition = {type: 'depart', direction: 'left'};
      modifiedState[newScreen].transition = {type: 'arrive', direction: 'right'};
      transition = true;

      ga('send', 'event', 'navigation', 'to ' + newScreen);
    } else {
      // Simple "forward"
      modifiedState.screens = {
        stack: this.state.screens.stack.concat(newScreen),
        i: this.state.screens.i + 1
      };

      modifiedState.transitionClasses = ' rs-showLeft rs-notransition';
      nextTransitionClasses = ' rs-showCenter rs-transition';
      modifiedState[previousScreen].transition = {type: 'depart', direction: 'left'};
      modifiedState[newScreen].transition = {type: 'arrive', direction: 'right'};
      transition = true;

      ga('send', 'event', 'navigation', 'to ' + newScreen);
    }

    if (this.state.sideMenuVisible)
      modifiedState.sideMenuVisible = false;

    this.setState(modifiedState);

    lastPreviousScreen = previousScreen;
    lastModifiedState = modifiedState;

    if (['INPUT', 'TEXTAREA'].indexOf(document.activeElement.tagName) !== -1) {
      document.activeElement.blur();
    }
  },
  backToPreviousScreen: function(){
    this.changeScreen(void 0, {back: true});
  },
  showSideMenu: function(){
    this.setState({sideMenuVisible: true});
  },
  hideSideMenu: function (e) {
    e.preventDefault();

    this.setState({sideMenuVisible: false});
  },
  componentDidUpdate: function(){
    var that = this;

    if (nextTransitionClasses) {
      _.defer(function(){
        var transitionClasses = nextTransitionClasses;
        nextTransitionClasses = '';
        that.setState({
          transitionClasses: transitionClasses,
        });

        _.delay(function(){
          var currentScreen = that.state.screens.stack[that.state.screens.i];
          lastModifiedState.transitionClasses = '';
          lastModifiedState[lastPreviousScreen].transition = void 0;
          lastModifiedState[lastPreviousScreen].visible = false;
          lastModifiedState[currentScreen].transition = void 0;
          that.setState(lastModifiedState);
        }, 260); // Important: keep this delay in sync with `.rs-transition` duration
      });
    }
  },
};

module.exports = ScreensMixin;