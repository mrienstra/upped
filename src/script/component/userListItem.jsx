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
    var thisStyle;
    if (!this.props.delayImageLoad && this.props.user.photoURL) {
      thisStyle = {
        background: '#fff url(' + this.props.user.photoURL + ') no-repeat',
        backgroundSize: 'contain',
      };
    };

    var secondItem;
    if (this.props.user.phrase && this.props.phrase) {
      secondItem = (
        <p>Offering: <b>{this.props.user.phrase}</b> for <b>{this.props.phrase}</b></p>
      );
    } else {
      secondItem = (
        <p>Stars?</p>
      );
    }

    var keywords = this.props.user.keywords ? this.props.user.keywords.map(function (name, i) {
      var category;
      if (name === parseInt(name.toString()) && (category = _.find(categories, {id: name}))) {
        name = category.name;
      }
      return <div key={i} className="item">{name}</div>;
    }) : void 0;

    return (
      <div className="stackListItem userListItem" onTouchEnd={this.handleToggleDetails} style={thisStyle}>
        <div className="list">
          <div className="item item-divider item-text-wrap">
            <h2>{this.props.user.name}</h2>
            {secondItem}
          </div>
          <div ref="lastVisibleItem" className="item item-text-wrap item-icon-right">
            {this.props.user.sushi}
            <i className="icon ion-chevron-right"></i>
          </div>
        </div>
        <div className="list">
          <div className="item">
            <i className="icon ion-earth"></i> {this.props.user.location}
          </div>
          <div className="item item-divider">
            <i className="icon ion-planet"></i> Keywords
          </div>
          {keywords}
        </div>
      </div>
    );
  }
});

module.exports = UserListItem;