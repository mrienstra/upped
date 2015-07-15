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

    var sushi, more;
    if (this.props.buttonsToTop || this.props.user.sushi.length < 140) {
      sushi = this.props.user.sushi;
    } else {
      sushi = this.props.user.sushi.substring(0,140) + '…';
    }
    if (!this.props.buttonsToTop) {
      more = (
        <i className="icon ion-chevron-right"></i>
      );
    }

    var keywords = this.props.user.keywords ? this.props.user.keywords.map(function (name, i) {
      var category;
      if (name === parseInt(name.toString()) && (category = _.find(categories, {id: name}))) {
        name = category.name;
      }
      return <div key={i} className="item">{name}</div>;
    }) : void 0;

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
            {secondItem}
          </div>
          <div className={'item item-text-wrap' + (this.props.buttonsToTop ? '' : ' item-icon-right')}>
            {sushi}
            {more}
          </div>
        </div>
        <div className="list" style={positionedListStyle}>
          <div className="item">
            <i className="icon ion-earth"></i> {this.props.user.location}
          </div>
          <div className="item item-divider">
            <i className="icon ion-planet"></i> Keywords
          </div>
          {keywords}
        </div>
        {proposedAmount}
      </div>
    );
  }
});

module.exports = UserListItem;