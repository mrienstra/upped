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