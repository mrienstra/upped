/** @jsx React.DOM */

var React = require('react/addons');

var utils = require('../utils');
var camera = require('../camera.js');

var likeMixin = require('../mixin/like.jsx');

var PostsListItem = React.createClass({
  mixins: [likeMixin],
  render: function(){
    var commentCount = this.props.comments.length;

    var likeClasses  = this.calculateLikeClasses();
    
    var picture;
    if (this.props.post.picture) {
      picture = <img src={this.props.post.picture} />;
    }

    return (
      <li className="table-view-cell">
        <a onTouchEnd={this.props.handlePostChange.bind(null, this.props)}>
          <div className="details">
            <img src={this.props.from.picture} />
            <h4>{this.props.from.name}</h4>
            <div className="time">{utils.momentFromNowIfTime(this.props.time)}</div>
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
            <p className={this.props.post.story ? 'emotes' : ''}>{picture}{this.props.post.story ? this.props.post.story : this.props.post.message}</p>
          </div>
        </a>
      </li>
    );
  }
});

var PostsList = React.createClass({
  render: function(){
    var props = this.props;
    var postsNodes;
    if (this.props.status === 'loading') {
      postsNodes = (
        <li className="table-view-cell loading"><p><span className="icon ion-ios7-reloading"></span> Loading...</p></li>
      );
    } else if (!this.props.posts || this.props.posts.length === 0) {
      postsNodes = (
        <li className="table-view-cell"><p><span className="icon ion-eye-disabled"></span> Nothing to see here.</p></li>
      );
    } else {
      postsNodes = this.props.posts.map(function (post, index) {
        var likeCount = post.likes ? post.likes.length : 0;

        var userLikes = !!post.likes && post.likes.some(function (like) {
          return like.id === props.userFbId;
        });

        return <PostsListItem key={index} id={post.id} handlePostChange={props.handlePostChange} from={post.from} time={post.time} post={post.post} likes={post.likes} likeCount={likeCount} userLikes={userLikes} comments={post.comments} handleLike={props.handleLike} refresh={props.refresh}></PostsListItem>;
      });
    }
    return (
      <ul className="table-view posts-list">
        {postsNodes}
      </ul>
    );
  }
});

var PostToolbar = React.createClass({
  getInitialState: function(){
    return {
      pictureDataURI: void 0
    };
  },
  showPicturePreview: function (pictureDataURI) {
    this.setState({
      pictureDataURI: pictureDataURI
    });
  },
  handleCamera: function(){
    camera.getPicture(
      this.showPicturePreview,
      function(){ console.error('handleCamera error', this, arguments); }
    );
  },
  handlePostSubmit: function(){
    console.log('PostToolbar handlePostSubmit', this, arguments);

    var input = this.getDOMNode().querySelector('textarea');

    var msg = input.value.trim();

    if (!msg) return;

    this.props.handlePostSubmit(msg, this.state.pictureDataURI);

    // Reset

    input.value = '';
    this.autoSize();

    this.setState({
      pictureDataURI: void 0
    });
  },
  componentDidMount: function(){
    var thisDOMNode, textareaSize, input;

    thisDOMNode = this.getDOMNode();
    textareaSize = thisDOMNode.querySelector('.textarea-size');
    input = thisDOMNode.querySelector('textarea');

    this.autoSize = function(){
      textareaSize.innerHTML = input.value + '\n';
    };

    this.autoSize();
  },
  render: function(){
    var toolbarLeft;
    if (this.state.pictureDataURI) {
      toolbarLeft = <div className="picturePreview" style={{backgroundImage: 'url(' + this.state.pictureDataURI + ')'}}></div>;
    } else {
      toolbarLeft = <a className="icon ion-camera" onTouchEnd={this.handleCamera}></a>
    }

    return (
      <div className="post-form-wrapper">
        <div className="promo hide">
          <p><span className="icon ion-radio-waves"></span>Are you here? Check in to chat!</p>
        </div>
        <div className="post-form">
          <div className="left">
            {toolbarLeft}
          </div>
          <div className="right">
            <a onTouchEnd={this.handlePostSubmit} className="inactive" id="post_button">Post</a>
          </div>
          <div className="center textarea-container">
            <textarea onInput={this.autoSize} placeholder="What are you up to?"></textarea>
            <div className="textarea-size"></div>
          </div>
        </div>
      </div>
    );
  }
});

var PostsScreen = React.createClass({
  getInitialState: function(){
    return {
      status: 'loading',
      posts: []
    };
  },
  handlePromise: function (postsPromise, options) {
    var that = this;

    if (!options || !options.quietStart) {
      this.setState({
        postsPromise: postsPromise,
        status: 'loading',
        posts: []
      });
    }

    postsPromise.then(
      function(posts){
        console.log('PostsScreen postsPromise', posts);

        that.setState({
          status: 'loaded',
          posts: posts
        });
      },
      function(response){
        alert('PostsScreen postsPromise failed!');
        console.warn('bad', response);

        that.setState({
          status: 'loaded',
          posts: []
        });
      }
    );
  },
  handlePostSubmit: function (msg, pictureDataURI) {
    console.log('PostsScreen handlePostSubmit', this, arguments);

    var that = this;

    var pendingPost = {
      id: '',
      from: {
        // todo: handle `this.props.user` not being available
        picture: this.props.user.picture,
        name: this.props.user.name
      },
      time: 'pending',
      post: {
        message: msg
      },
      comments:[]
    };

    var newPosts = [pendingPost].concat(this.state.posts);
    this.setState({posts: newPosts});

    var onSuccess = function (response) {
      console.log('PostsScreen handlePostSubmit onSuccess', this, arguments, response.id);

      var newPosts = that.state.posts.concat();
      if (newPosts.some(function (post, i) {
        if (post.post.message === msg && post.time === 'pending') {
          newPosts[i].time = 'a few seconds ago'; // Same as `moment().fromNow()`
          newPosts[i].id = response.id;
          return true;
        }
      })) {
        that.setState({posts: newPosts});
      }
    };

    var onFailure = function (response) {
      alert('Todo: PostsScreen handlePostSubmit error: ' + JSON.stringify(response));

      var newPosts = that.state.posts.concat();
      if (newPosts.some(function (post, i) {
        if (post.post.message === msg && post.time === 'pending') {
          newPosts.splice(i, 1);
          return true;
        }
      })) {
        that.setState({posts: newPosts});
      }
    };

    this.props.handleCreatePost(
      msg,
      pictureDataURI,
      onSuccess,
      onFailure
    );
  },
  refresh: function(){
    var postsPromise = this.props.getPosts();

    this.handlePromise(postsPromise, {quietStart: true});
  },
  componentWillMount: function(){
    console.log('PostsScreen.componentWillMount()', this, arguments);

    var postsPromise = this.props.getPosts();

    this.handlePromise(postsPromise);
  },
  componentWillReceiveProps: function (nextProps) {
    console.log('PostsScreen.componentWillReceiveProps()', this, arguments);

    var postsPromise = nextProps.getPosts();

    this.handlePromise(postsPromise);
  },
  render: function(){
    console.log('PostsScreen.render()', this, arguments);
    var promotion;
    if (this.props.promotion) {
      promotion = (
        <ul className="table-view">
          <li className="table-view-divider">{this.props.promotion.title}</li>
          <li className="table-view-cell media">
            <a href="" data-transition="slide-in">
            <p className="navigate-right"><span className="icon ion-beer"></span> {this.props.promotion.message}</p>
            </a>
          </li>
        </ul>
      );
    };

    var posts = (this.state.posts.length) ? this.state.posts : this.props.posts;

    return (
      <div>
        <header className="bar bar-nav">
          <a className="btn btn-link btn-nav pull-left" onTouchEnd={this.props.handleBack} data-transition="slide-out"><span className="icon icon-left-nav"></span> Back</a>
          <a className="btn btn-link btn-nav pull-right" onTouchEnd={function(){alert('Todo');}}>Check In</a>
          <h1 className="title">Bar Wall</h1>
        </header>

        <div className="content">
          <div className="overview">
            <div className="cover-image">
              <span className="icon ion-loading-d"></span>
              <img src="/img/pixel_trans_1x1.png" height="1" width="1" style={{backgroundImage: 'url(' + this.props.photoURL + ')'}}/>
            </div>
            <div className="content-overlay">
              <h3>{this.props.name}</h3>
              <h4><span className="icon ion-person-stalker"></span> <span className="count">{this.props.checkedInCount ? this.props.checkedInCount : '0'}</span> checked in / {this.props.distance ? this.props.distance : '0 ft'}
                <div className="buttons">
                  <a href=""><span className="badge">Address</span></a>
                </div>
              </h4>
            </div>
          </div>
          <PostToolbar handlePostSubmit={this.handlePostSubmit}></PostToolbar>

          {promotion}

          <PostsList posts={posts} status={this.state.status} userFbId={this.props.user.fb.id} handlePostChange={this.props.handlePostChange} handleLike={this.props.handleLike} refresh={this.refresh}></PostsList>
        </div>
      </div>
    );
  }
});

module.exports = PostsScreen;