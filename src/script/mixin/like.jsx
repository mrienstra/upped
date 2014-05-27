/** @jsx React.DOM */

var likeMixin = {
  getInitialState: function(){
    return {
      likeCount: this.props.likeCount,
      pendingLikeChange: false,
      userLikes: this.props.userLikes
    };
  },
  propTypes: {
    handleLike: React.PropTypes.func.isRequired,
    id: React.PropTypes.string.isRequired,
    likeCount: React.PropTypes.number.isRequired,
    refresh: React.PropTypes.func.isRequired,
    userLikes: React.PropTypes.bool.isRequired
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
    e.stopPropagation();

    var that = this;

    var newUserLikes = !this.state.userLikes;

    this.setState({
      likeCount: this.state.likeCount + (newUserLikes ? 1 : -1),
      pendingLikeChange: true,
      userLikes: newUserLikes
    });

    var onSuccess = function(){
      that.setState({
        pendingLikeChange: false
      });
    };

    var onFailure = function (msg) {
      alert('Todo: likeMixin handleLike onFailure: ' + JSON.stringify(msg));

      var newUserLikes = !that.state.userLikes;

      that.setState({
        likeCount: that.state.likeCount + (newUserLikes ? 1 : -1),
        pendingLikeChange: false,
        userLikes: newUserLikes
      });
    };

    this.props.handleLike(this.props.id, newUserLikes, onSuccess, onFailure);
  },
  componentWillReceiveProps: function(nextProps) {
    this.setState({
      likeCount: nextProps.likeCount,
      pendingLikeChange: false,
      userLikes: nextProps.userLikes
    });
  }
};

module.exports = likeMixin;