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
      if (props.transition.type === 'depart') {
        classNames.push('rs-' + props.transition.direction);
      }
    } else if (!props.visible) {
      classNames.push('hide');
    }

    this.setState({
      'classNames': classNames
    });
  },
  componentWillMount: function(){
    this.applyTransitionClasses(this.props);
  },
  componentWillReceiveProps: function (nextProps) {
    this.applyTransitionClasses(nextProps);
  },
  shouldComponentUpdate: function (nextProps, nextState) {
    if (!this.props.visible && !nextProps.visible) {
      return false;
    } else {
      return true;
    }
  },
};

module.exports = ScreenTransitionMixin;
