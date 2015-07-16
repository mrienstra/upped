var React = require('react');

// Data
var categories = require('../data/categories.js');

// Libs
var _ = require('lodash');

// Mixins
var ToggleStackListItemMixin = require('../mixin/toggleStackListItem.js');

var UserListItem = React.createClass({
  mixins: [ToggleStackListItemMixin],
  getInitialState: function(){
    return {
      imageHeight: 0,
    };
  },
  setMarginTop: function(){
    var that = this;
    if (!this.props.buttonsToTop && this.props.contentTop) {
      var imageHeight = React.findDOMNode(this.refs.positionedList).getBoundingClientRect().top - this.props.contentTop;
      if (imageHeight !== this.state.imageHeight) {
        _.defer(function(){
          that.setState({'imageHeight': imageHeight});
        });
      }
    }
  },
  componentDidMount: function(){
    this.setMarginTop();
  },
  componentDidUpdate: function(){
    this.setMarginTop();
  },
  render: function() {
    var thisStyle;
    if (!this.props.delayImageLoad && this.props.user.photoURL) {
      thisStyle = {
        background: '#fff url(' + this.props.user.photoURL + ') no-repeat',
        backgroundSize: 'contain',
      };
    };

    var positionedListStyle;
    if (this.props.buttonsToTop) {
      positionedListStyle = {top: this.state.imageHeight};
    }

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

    var sushi, more;
    if (this.props.buttonsToTop || this.props.user.sushi.length < 140) {
      sushi = this.props.user.sushi;
    } else {
      sushi = this.props.user.sushi.substring(0,140) + '…';
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
          <i className="icon ion-email"></i>
          <h2>Sushi</h2>
          {sushi}
          {keywords}
          <p><a href={'http://www.yelp.com/biz/' + this.props.user.yelp.id}>My Yelp Profile</a></p>
        </div>
      );
    } else {
      secondItem = (
        <div className="item item-text-wrap item-icon-right">
          {sushi}
          <i className="icon ion-chevron-right"></i>
        </div>
      );
    }

    var thirdItem;
    if (this.props.buttonsToTop) {
      thirdItem = (
        <div className="item item-icon-left item-text-wrap">
          <i className="icon ion-email"></i>
          <h2>Reviews</h2>
          <img src={this.props.user.yelp.review.user.image_url} style={{width: '10%'}}/>
          <p>{this.props.user.yelp.review.user.name}</p>
          <p>{this.props.user.yelp.review.rating} stars</p>
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
        <div ref="positionedList" className="list" style={positionedListStyle}>
          <div className="item item-divider item-text-wrap">
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