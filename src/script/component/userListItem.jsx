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

    var firstItemSub;
    var i, reviewStars = [];
    for (i = 0, l = this.props.user.yelp.review.rating; i < l; i++) {
      reviewStars.push(
        <i key={i} className="icon ion-ios-star rating"></i>
      );
    }

    var keywords = this.props.user.keywords ? this.props.user.keywords.map(function (name, i) {
      var category;
      if (name === parseInt(name.toString()) && (category = _.find(categories, {id: name}))) {
        name = category.name;
      }
      return <p key={i}>&raquo; {name}</p>;
    }) : void 0;

    return (
      <div className={'stackListItem userListItem' + (this.props.isFrontmost ? ' frontmost' : '')} onTouchEnd={this.handleToggleDetails} style={thisStyle}>
        <div className="list">
          <div className="item item-divider">
            <h2>{this.props.user.name}</h2>
            <div>
              <p className="credit">up to <strong>${this.props.proposedAmount}</strong> credit </p>
              <p>{reviewStars}</p>
            </div>
          </div>
          <div className="sushi item item-text-wrap">
            <h3><i className="icon ion-leaf"></i> Sushi</h3>
            <p>{this.props.user.sushi}</p>
            {keywords}
            <p><a href={'http://www.yelp.com/biz/' + this.props.user.yelp.id}>My Yelp Profile</a></p>
          </div>
          <div className="review item item-text-wrap">
            <h3><i className="icon ion-chatbubbles"></i> Reviews</h3>
            <img src={this.props.user.yelp.review.user.image_url} style={{width: '10%', float: 'left', marginRight: '10px'}}/>
            <p>{this.props.user.yelp.review.user.name}</p>
            <div className="stars">{reviewStars}</div>
            <p>{this.props.user.yelp.review.excerpt}</p>
            <p><a href={'http://www.yelp.com/biz/' + this.props.user.yelp.id + '#super-container'}>All Yelp Reviews</a></p>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = UserListItem;