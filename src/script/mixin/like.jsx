/** @jsx React.DOM */

var likeMixin = {
  getInitialState: function(){
    return {
      pendingLikeChange: false,
      userLikes: this.props.userLikes
    };
  },
  propTypes: {
    handleLike: React.PropTypes.func.isRequired,
    id: React.PropTypes.string.isRequired,
    refresh: React.PropTypes.func.isRequired,
    userLikes: React.PropTypes.bool.isRequired
  },
  adjustLikeCount: function (likeCount) {
    if (this.state.pendingLikeChange) {
      likeCount += this.state.userLikes ? 1 : -1;
    }

    if (likeCount === 0) likeCount = '';

    return likeCount;
  },
  calculateLikeClasses: function(){
    var likeClasses = {
      count: 'count',
      heart: this.state.userLikes ? 'icon ion-ios7-heart' : 'icon ion-ios7-heart-outline'
    };

    if (this.state.pendingLikeChange) {
      likeClasses.count += ' pending';
      likeClasses.heart += ' pending';
    }

    return likeClasses;
  },
  handleLike: function (e) {
    var that = this;

    e.stopPropagation();

    this.setState({
      pendingLikeChange: true,
      userLikes: !this.state.userLikes
    });

    this.props.handleLike(this.props.id, this.props.userLikes, this.props.refresh);
  },
  componentWillReceiveProps: function(nextProps) {
    this.setState({
      pendingLikeChange: false,
      userLikes: nextProps.userLikes
    });
  }
};

module.exports = likeMixin;