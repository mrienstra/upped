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
    if (this.props.user.phrase && this.props.phrase) {
      firstItemSub = (
        <p>Offering: <b>{this.props.user.phrase}</b> for <b>{this.props.phrase}</b></p>
      );
    } else {
      firstItemSub = (
        <p>Stars?</p>
      );
    }

    var secondItem;
    if (this.props.buttonsToTop) {
      var keywords = this.props.user.keywords ? this.props.user.keywords.map(function (name, i) {
        var category;
        if (name === parseInt(name.toString()) && (category = _.find(categories, {id: name}))) {
          name = category.name;
        }
        return <p key={i}>» {name}</p>;
      }) : void 0;
      secondItem = (
        <div className="item item-icon-left item-text-wrap">
          <i className="icon ion-ribbon-b"></i>
          <h3>Sushi</h3>
          {this.props.user.sushi}
          {keywords}
          <p><a href={'http://www.yelp.com/biz/' + this.props.user.yelp.id}>My Yelp Profile</a></p>
        </div>
      );
    }

    var thirdItem;
    if (this.props.buttonsToTop) {
      var i, reviewStars = [];
      for (i = 0, l = this.props.user.yelp.review.rating; i < l; i++) {
        reviewStars.push(
          <i className="icon ion-ios-star"></i>
        );
      }
      thirdItem = (
        <div className="item item-icon-left item-text-wrap">
          <i className="icon ion-ribbon-b"></i>
          <h3>Reviews</h3>
          <img src={this.props.user.yelp.review.user.image_url} style={{width: '10%', float: 'left', marginRight: '10px'}}/>
          <h4>{this.props.user.yelp.review.user.name}</h4>
          <div className="stars">{reviewStars}</div>
          <p>{this.props.user.yelp.review.excerpt}</p>
          <p><a href={'http://www.yelp.com/biz/' + this.props.user.yelp.id + '#super-container'}>All Yelp reviews »</a></p>
        </div>
      );
    }

    var proposedAmount;
    if (this.props.proposedAmount) {
      proposedAmount = (
        <div className="proposedAmount"><b>${this.props.proposedAmount}</b> credit</div>
      );
    }

    return (
      <div className={'stackListItem userListItem' + (this.props.isFrontmost ? ' frontmost' : '')} onTouchEnd={this.handleToggleDetails} style={thisStyle}>
        <div className="list">
          <div className="item item-divider">
            <h2>{this.props.user.name}</h2>
            {firstItemSub}
          </div>
          {secondItem}
          {thirdItem}
        </div>
        <div className="blockImageBehindFooter"></div>
        {proposedAmount}
      </div>
    );
  }
});

module.exports = UserListItem;