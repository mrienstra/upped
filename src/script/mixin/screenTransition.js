var React = require('react');

// Libs
var _ = require('lodash');

var ScreenTransitionMixin = {
  getInitialState: function(){
    return {
      classNames: []
    }
  },
  applyTransitionClasses: function (props) {
    var classNames = ['pane'];

    if (props.cssClass) {
      classNames.push(props.cssClass);
    }

    if (props.transition) {
      if (props.transition.inProgress) {
        if (props.transition.type === 'depart') {
          classNames.push('rs-transition', 'rs-' + props.transition.direction);
        } else {
          classNames.push('rs-transition', 'rs-center');
        }
      } else {
        if (props.transition.type === 'depart') {
          classNames.push('rs-center');
        } else {
          classNames.push('rs-' + props.transition.direction);
        }
      }
    } else if (!props.visible) {
      classNames.push('hide');
    }

    this.setState({classNames: classNames});
  },
  componentWillMount: function(){
    this.applyTransitionClasses(this.props);
  },
  componentWillReceiveProps: function (nextProps) {
    this.applyTransitionClasses(nextProps);
  },
};

module.exports = ScreenTransitionMixin;
