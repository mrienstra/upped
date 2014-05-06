/** @jsx React.DOM */

var React = require('react/addons');

var ReactTransitionEvents = require('react/lib/ReactTransitionEvents');

var _ = require('lodash');



var noisy = false; // show console output



var cssPrefix = 'rs-';
var cssClass = {
  screens:    cssPrefix + 'screens',
  screen:     cssPrefix + 'screen',
  left:       cssPrefix + 'left',
  center:     cssPrefix + 'center',
  right:      cssPrefix + 'right',
  transition: cssPrefix + 'transition',
};



var Screens = React.createClass({
  getInitialState: function() {
    return {status: 'init'};
  },
  componentWillReceiveProps: function(){
    if (noisy) console.log('ReactScreens Screens componentWillReceiveProps', this, arguments);

    if (this.props.transition === 0 && this.state.status === 'transition') {
      this.setState({status: ''});
    }
  },
  componentDidUpdate: function(){
    if (noisy) console.log('ReactScreens Screens componentDidUpdate', this, arguments);

    var that = this;
    _.forEach(this.getDOMNode().querySelectorAll('.' + cssClass.screen), function (screenNode) {
      ReactTransitionEvents.removeEndEventListener( // todo: helpful?
        screenNode,
        that.props.handleTransitionEnd
      );
      ReactTransitionEvents.addEndEventListener(
        screenNode,
        that.props.handleTransitionEnd
      );
    });
  },
  render: function() {
    if (noisy) console.log('ReactScreens Screens render', this, arguments);

    var that = this;
    var inTransition = this.state.status === 'transition';
    var delta = inTransition ? this.props.transition : 0;

    var possiblePositions;
    if (delta === -1) {
      possiblePositions = ['center', 'right'];
    } else if (delta === 0) {
      possiblePositions = ['left', 'center', 'right'];
    } else if (delta === 1) {
      possiblePositions = ['left', 'center'];
    }

    screenClassNames = _.times(this.props.children.length, function(){ return [cssClass.screen]; });

    possiblePositions.forEach(function (position) {
      var positionIndex = that.props.positions[position];
      if (positionIndex !== void 0 && screenClassNames[positionIndex + delta]) {
        screenClassNames[positionIndex + delta].push(cssClass[position]);
        if (inTransition) {
          screenClassNames[positionIndex + delta].push(cssClass.transition);
        }
      }
    });

    var screenNodes = this.props.children.map(function (screen, index) {
      return (
        <div key={index} className={screenClassNames[index].join(' ')}>
          {screen}
        </div>
      );
    });

    if (!inTransition && this.props.transition) {
      _.defer(function(){
        that.setState({status: 'transition'});
      });
    }

    return (
      <div className={cssClass.screens}>
        {screenNodes}
      </div>
    );
  }
});



var ReactScreens = function (container) {
  var screens = [];
  var state = {
    positions: {
      center: 0
    },
    transition: 0
  };

  var reactScreens = {
    addScreen: function (screen, position) {
      if (noisy) console.log('ReactScreens addScreen', this, arguments);

      var screenIndex = state.positions.center + 1;

      screens.splice(screenIndex, 1, {
        screen: screen,
        position: position,
        parentIndex: screens.length - 1
      });

      if (screens.length === 1) {
        state = {
          positions: {
            center: 0
          },
          transition: 0
        };
      } else {
        state = {
          positions: {
            left: screenIndex - 2,
            center: screenIndex - 1,
            right: screenIndex - 0,
          },
          transition: 1
        };
      }

      reactScreens.render();
    },
    back: function(){
      if (noisy) console.log('ReactScreens back', this, arguments);

      state.transition = -1;

      reactScreens.render();
    },
    handleTransitionEnd: function(){
      if (noisy) console.log('ReactScreens handleTransitionEnd', this, arguments);

      _.forEach(this.parentNode.children, function (screenNode) {
        ReactTransitionEvents.removeEndEventListener(
          screenNode,
          reactScreens.handleTransitionEnd
        );
      });

      state = {
          positions: {
            left: state.positions.left + state.transition,
            center: state.positions.center + state.transition,
            right: state.positions.right + state.transition,
          },
          transition: 0
        };

      reactScreens.render();
    },
    render: function () {
      if (noisy) console.log('ReactScreens render', this, arguments);
      React.renderComponent(
        <Screens positions={state.positions} transition={state.transition} handleTransitionEnd={reactScreens.handleTransitionEnd}>
          {screens}
        </Screens>
        ,
        container
      );
    }
  };

  return reactScreens;
};



module.exports = ReactScreens;