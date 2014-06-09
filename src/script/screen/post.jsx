/** @jsx React.DOM */

var React = require('react/addons');

// Modules
var utils = require('../utils');

// Mixins
var likeMixin = require('../mixin/like.js');
var postOrCommentSubmitMixin = require('../mixin/postOrCommentSubmit.js');

// Components
var PostOrCommentToolbar = require('../component/postOrCommentToolbar.jsx');

var CommentListItem = React.createClass({
  mixins: [likeMixin],
  render: function() {
    var likeClasses  = this.calculateLikeClasses();

    var picture;
    if (this.props.picture) {
      picture = <img src={this.props.picture} />;
    }

    return (
      <li className="table-view-cell posts-list">
        <div className="details">
          <img onTouchEnd={this.props.handleProfileChange.bind(null, this.props.from, false)} src={this.props.from.picture} />
          <h4>{this.props.from.name}</h4>
          <div className="time">{utils.momentFromNowIfTime(this.props.time)}</div>
          <div className="stats">
            <span className={likeClasses.likes}>
              <span className="badge" onTouchEnd={this.handleLike}>{this.state.likeCount || 'like' }<span className={likeClasses.heart}></span></span>
            </span>
          </div>
        </div>
        <div className="copy">
          <p>{picture}{this.props.message}</p>
        </div>
      </li>
    );
  }
});

var PostSingle = React.createClass({
  mixins: [likeMixin],
  render: function(){
    var that = this;
    var post = this.props.post;

    var likeClasses  = this.calculateLikeClasses();

    var commentCount = this.props.comments ? this.props.comments.length : 0;

    var commentsNodes = this.props.comments ? this.props.comments.map(function (comment, index) {
      return <CommentListItem key={index} id={comment.id} from={comment.from} time={comment.time} picture={comment.picture} message={comment.message} likeCount={comment.likeCount} userLikes={comment.userLikes} refresh={that.props.refresh} handleProfileChange={that.props.handleProfileChange} handleLike={that.props.handleLike}></CommentListItem>;
    }) : [];
    return (
      <div>
        <div className="overview">
          <div className="cover-image cover-full">
            <img src={post.post.picture} />
          </div>
        </div>
        <ul className="table-view posts-list">
          <li className="table-view-cell">
            <div className="details">
              <img onTouchEnd={this.props.handleProfileChange.bind(null, post.from, false)} src={post.from.picture} />
              <h4>{post.from.name}</h4>
              <div className="time">{utils.momentFromNowIfTime(post.time)}</div>
              <div className="stats">
                <span className={likeClasses.likes}>
                  <span className="badge" onTouchEnd={this.handleLike}>{this.state.likeCount || 'like' }<span className={likeClasses.heart}></span></span>
                </span>
                <span className="comments">
                  <span className="badge">{commentCount ? commentCount : 'reply'}<span className="icon ion-ios7-chatbubble"></span></span>
                </span>
              </div>
            </div>
            <div className="copy">
              <p className={post.post.story ? 'emotes' : ''}>{post.post.story ? post.post.story : post.post.message}</p>
            </div>
          </li>
          {commentsNodes}
        </ul>
      </div>
    );
  }
});

var PostScreen = React.createClass({
  // Todo: move methods `getInitialState`, `handlePromise` & `refresh` into a mixin (since they are virtually identical to methods in `PostsScreen`)
  mixins: [postOrCommentSubmitMixin],
  getInitialState: function(){
    return {
      post: void 0,
      comments: []
    };
  },
  handlePromise: function (postPromise) {
    var that = this;

    postPromise.then(
      function(post){
        console.log('PostScreen postPromise', post);

        var comments = post.comments;
        delete post.comments;

        that.setState({
          post: post,
          comments: comments
        });

        // Todo: this does not need to be called when liking/unliking a comment, as comment likes are not displayed on `PostsScreen`.
        that.props.refreshPosts();
      },
      function(response){
        alert('PostScreen postPromise failed!');
        console.warn('bad', response);
      }
    );
  },
  refresh: function(){
    var postPromise = this.props.getPost();

    this.handlePromise(postPromise);
  },
  componentWillReceiveProps: function (nextProps) {
    console.log('PostScreen.componentWillReceiveProps()', this, arguments);

    this.setState({
      post: void 0,
      comments: []
    });
  },
  render: function() {
    var userFbId = this.props.user.fb.id;

    var post = this.state.post ? this.state.post : this.props.post;

    var comments = this.state.comments.length ? this.state.comments : this.props.comments;

    var likeCount = post.likes ? post.likes.length : 0;

    var userLikes = !!post.likes && post.likes.some(function (like) {
      return like.id === userFbId;
    });

    return (
      <div>
        <header className="bar bar-nav">
          <a className="btn btn-link btn-nav pull-left" onTouchEnd={this.props.handleBack} data-transition="slide-out"><span className="icon icon-left-nav"></span> Back</a>
          <a className="icon icon-compose pull-right" href="#composeModal"></a>
          <h1 className="title">Wall Post</h1>
        </header>
        <div className="content">
          <PostSingle id={post.id} post={post} comments={comments} likeCount={likeCount} userLikes={userLikes} refresh={this.refresh} handleProfileChange={this.props.handleProfileChange} handleLike={this.props.handleLike}></PostSingle>
          <PostOrCommentToolbar placeholderText="And then you were all like...?" isPostsOrComments="comments" handlePostOrCommentSubmit={this.handlePostOrCommentSubmit}></PostOrCommentToolbar>
        </div>
      </div>
    );
  }
});

module.exports = PostScreen;