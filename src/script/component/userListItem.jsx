var React = require('react');

// Data
var categories = require('../data/categories.js');

// Libs
var _ = require('lodash');

// Mixins
var ToggleStackListItemMixin = require('../mixin/toggleStackListItem.js');

var UserListItem = React.createClass({
  mixins: [ToggleStackListItemMixin],
  render: function() {
    var img = this.props.user.photoURL ? <img src={this.props.user.photoURL}/> : '';

    var skills = this.props.user.skills.map(function (name, i) {
      var category;
      if (name === parseInt(name.toString()) && (category = _.find(categories, {id: name}))) {
        name = category.name;
      }
      return <li key={i}>{name}</li>;
    });

    var nominations = this.props.user.nominations.map(function (nomination, i) {
      return (
        <li key={i}>
          <img/>
          <h5>{nomination.name}</h5>
          <span className="skill">{nomination.skill}</span>
          <p>{nomination.text}</p>
        </li>
      );
    });

    return (
      <div className="stackListItem userListItem" onTouchEnd={this.handleToggleDetails}>
        {img}
        <div className={'summary' + (this.state.expanded ? ' hide' : '')}>
          <div className="nameAndSkillCount">{this.props.user.name}</div>
          <div className="statement">{this.props.user.statement}</div>
        </div>
        <div className={'details' + (this.state.expanded ? ' show' : '')}>
          <div className="nameAndSkillCount">{this.props.user.name}</div>
          <div className="statement">{this.props.user.statement}</div>
          <div className="distance hide">{this.props.user.distance}</div>
          <div className="location">{this.props.user.location}</div>
          <div className="skills">
            <h4><span className="icon ion-ios7-bolt"></span> Super Powers</h4>
            <ul>
              {skills}
            </ul>
          </div>
          <div className="nominations">
            <h4><span className="icon ion-ribbon-b"></span> Hero Nominations</h4>
            <ul>
              {nominations}
            </ul>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = UserListItem;