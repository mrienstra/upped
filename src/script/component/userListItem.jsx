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
      return <div key={i} className="item">{name}</div>;
    });

    return (
      <div className="list stackListItem userListItem" onTouchEnd={this.handleToggleDetails}>
        <div className="item item-image">
          {img}
        </div>
        <div className="item item-divider item-text-wrap">
          <h2>{this.props.user.name}</h2>
          <h3>{this.props.user.sushi}</h3>
        </div>
        <div className={'item' + (this.state.expanded ? ' show' : '')}>
          <h3>
            <i className="icon ion-earth"></i> {this.props.user.location}
          </h3>
        </div>
      </div>
    );
  }
});

module.exports = UserListItem;