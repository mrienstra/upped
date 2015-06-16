var React = require('react');

// Libs
var _ = require('lodash');

var ScreenTransitionMixin = {
  getInitialState: function(){
    return {
      classNames: []
    }
  },
  initTransition: function (props) {
    var transitionState = (props.transition) ? 'init' : void 0;

    this.applyTransitionClasses(props, transitionState);
  },
  applyTransitionClasses: function (props, transitionState) {
    var classNames = ['pane'];

    if (props.cssClass) {
      classNames.push(props.cssClass);
    }

    if (props.transition && transitionState === 'init') {
      if (props.transition.type === 'depart') {
        classNames.push('rs-center');
      } else {
        classNames.push('rs-' + props.transition.direction);
      }
    } else if (props.transition && transitionState === 'inProgress') {
      if (props.transition.type === 'depart') {
        classNames.push('rs-transition', 'rs-' + props.transition.direction);
      } else {
        classNames.push('rs-transition', 'rs-center');
      }
    } else if (!props.visible) {
      classNames.push('hide');
    }

    this.setState({
      'classNames': classNames,
      'transitionState': transitionState,
    });
  },
  blurInputs: function(){
    Array.prototype.forEach.call(
      React.findDOMNode(this).getElementsByTagName('input'),
      function (el) {
        el.blur();
      }
    );
  },
  componentWillMount: function(){
    this.initTransition(this.props);
  },
  componentWillReceiveProps: function (nextProps) {
    this.initTransition(nextProps);

    if (nextProps.transition && nextProps.transition.inProgress && nextProps.transition.type === 'depart') {
      _.defer(this.blurInputs);
    }
  },
  componentDidUpdate: function(){
    var that = this;

    if (this.props.transition && this.state.transitionState === 'init') {
      _.defer(function(){
        that.applyTransitionClasses(that.props, 'inProgress');
      });
    }
  },
};

module.exports = ScreenTransitionMixin;
