/** @jsx React.DOM */

var React = require('react/addons');

var utils = require('../utils');

var loveMixin = require('../mixin/love.jsx');

var CommentListItem = React.createClass({
  render: function() {
    return (
      <li className="table-view-cell posts-list">
        <div className="details">
          <img src={this.props.from.picture} />
          <h4>{this.props.from.name}</h4>
          <div className="time">{utils.momentFromNowIfTime(this.props.time)}</div>
        </div>
        <div className="copy">
          <p>{this.props.message}</p>
        </div>
      </li>
    );
  }
});

var PostSingle = React.createClass({
  mixins: [loveMixin],
  render: function() {
    var post = this.props.post;

    var likeCount = post.likes ? post.likes.length : '';

    var heartClasses = this.state.userLoves ? 'icon ion-ios7-heart' : 'icon ion-ios7-heart-outline';
    if (this.state.pendingLoveChange) {
      heartClasses += ' pending';
    }

    var commentCount = post.comments.length;

    var commentsNodes = post.comments.map(function (comment, index) {
      return <CommentListItem key={index} from={comment.from} time={comment.time} message={comment.message} likes={comment.likes} liked={comment.liked}></CommentListItem>;
    });
    return (
      <ul className="table-view posts-list">
        <li className="table-view-cell">
          <img className="fullWidth" src={post.post.picture} />
          <div className="details">
            <img src={post.from.picture} />
            <h4>{post.from.name}</h4>
            <div className="time">{utils.momentFromNowIfTime(post.time)}</div>
            <div className="stats"><span className="likes"><span className="count">{likeCount}</span><span className={heartClasses}></span></span>
              <span className="comments"><span className="count">{commentCount ? commentCount : ' '}</span><span className="icon ion-ios7-chatboxes-outline"></span></span></div>
          </div>
          <div className="copy">
            <p className={post.post.story ? 'emotes' : ''}>{post.post.story ? post.post.story : post.post.message}</p>
          </div>
        </li>
        <li className="table-view-cell table-view-divider">
          <div className="copy">
            <div className="buttons"><a className="btn" onTouchEnd={this.handleLove}><span className="icon ion-heart"></span> Like</a> <a className="btn"><span className="icon ion-chatbubble"></span> Comment</a> <a className="btn"><span className="icon ion-beer"></span> Gift</a></div>
          </div>
        </li>
        {commentsNodes}
      </ul>
    );
  }
});

var PostScreen = React.createClass({
  // Todo: move methods `getInitialState`, `handlePromise` & `refresh` into a mixin (since they are virtually identically to methods in `PostsScreen`)
  getInitialState: function(){
    return {
      post: void 0
    };
  },
  handlePromise: function (postPromise) {
    var that = this;

    postPromise.then(
      function(post){
        console.log('PostScreen postPromise', post);

        that.setState({
          post: post
        });

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
      post: void 0
    });
  },
  render: function() {
    var userFbId = this.props.user.fb.id;

    var post = this.state.post ? this.state.post : this.props.post;

    var userLoves = !!post.likes && post.likes.some(function (like) {
      return like.id === userFbId;
    });

    return (
      <div>
        <header className="bar bar-nav">
          <a className="btn btn-link btn-nav pull-left" onTouchEnd={this.props.handleBack} data-transition="slide-out"><span className="icon icon-left-nav"></span> Back</a>
          <a className="icon icon-compose pull-right" href="#composeModal"></a>
          <h1 className="title">Wall Post</h1>
        </header>

        <div className="bar bar-standard bar-header-secondary">
          <p>{this.props.location}</p>
        </div>

        <div className="content">
          <PostSingle id={post.id} post={post} userLoves={userLoves} refresh={this.refresh} handleLove={this.props.handleLove}></PostSingle>
        </div>
      </div>
    );
  }
});

module.exports = PostScreen;