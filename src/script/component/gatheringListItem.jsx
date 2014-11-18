/** @jsx React.DOM */

var React = require('react/addons');

// Mixins
var toggleStackListItem = require('../mixin/toggleStackListItem.js');

// Modules
var utils = require('../utils');

var GatheringListItem = React.createClass({
  mixins: [toggleStackListItem],
  render: function() {
    var img = this.props.gathering.photoURL ? <img src={this.props.gathering.photoURL}/> : '';

    var date = utils.momentFormatIfTime(this.props.gathering.date);
    var fromNow = utils.momentFromNowIfTime(this.props.gathering.date);

    return (
      <div className="stackListItem gatheringListItem" onTouchEnd={this.handleToggleDetails}>
        {img}
        <div className="summary">
          <div className="nameAndSkillCount">{date}</div>
          <div className="location">{this.props.gathering.location} {fromNow}</div>
        </div>
        <div className={'details' + (this.state.expanded ? ' show' : '')}>
          <div className="blurb">{this.props.gathering.blurb}</div>
        </div>
      </div>
    );
  }
});

module.exports = GatheringListItem;