/** @jsx React.DOM */

var React = require('react/addons');

var utils = require('../utils');
var camera = require('../camera.js');

var loveMixin = require('../mixin/love.jsx');

var PostsListItem = React.createClass({
  mixins: [loveMixin],
  render: function(){
    var commentCount = this.props.comments.length;

    var likeCount = this.props.likes ? this.props.likes.length : '';

    var heartClasses = this.state.userLoves ? 'icon ion-ios7-heart' : 'icon ion-ios7-heart-outline';
    if (this.state.pendingLoveChange) {
      heartClasses += ' pending';
    }

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
              <span className="likes">
                <span className="count">{likeCount}</span>
                <span className={heartClasses} onTouchEnd={this.handleLove}></span>
              </span>
              <span className="comments">
                <span className="count">{commentCount ? commentCount : ''}</span>
                <span className="icon ion-ios7-chatboxes-outline"></span>
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
        var userLoves = !!post.likes && post.likes.some(function (like) {
          return like.id === props.userFbId;
        });

        return <PostsListItem key={index} id={post.id} handlePostChange={props.handlePostChange} from={post.from} time={post.time} post={post.post} likes={post.likes} userLoves={userLoves} comments={post.comments} handleLove={props.handleLove} refresh={props.refresh}></PostsListItem>;
      });
    }
    return (
      <ul className="table-view posts-list">
        <li className="table-view-cell table-view-divider">Recent Activity</li>
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
      <div className="bar bar-standard bar-footer">
        <div className="left">
          {toolbarLeft}
        </div>
        <div className="right">
          <a onTouchEnd={this.handlePostSubmit}>Post</a>
        </div>
        <div className="center textarea-container">
          <textarea onInput={this.autoSize} placeholder="What are you up to?"></textarea>
          <div className="textarea-size"></div>
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

    var pendingPost = {
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

    var posts = this.state.posts;
    var newPosts = [pendingPost].concat(posts);
    this.setState({posts: newPosts});

    this.props.handleCreatePost(
      msg,
      pictureDataURI,
      this.refresh
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
        <ul className="table-view flush">
          <li className="table-view-cell table-view-divider">{this.props.promotion.title}</li>
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
          <a className="icon ion-search pull-right" onTouchEnd={function(){alert('Todo');}}></a>
          <h1 className="title">{this.props.name}</h1>
        </header>

        <div className="bar bar-standard bar-header-secondary" style={{backgroundImage: 'url(' + this.props.photoURL + ')'}}>
          <p><span className="icon ion-person-stalker"></span> {this.props.checkedInCount ? this.props.checkedInCount + ' checked in' : 'Tumbleweed & crickets'}</p>
        </div>

        <div className="content">
          <ul className="table-view flush">
            <li className="table-view-cell">
              <h4>Address</h4>
              <p>{this.props.address1}</p>
              <p>{this.props.address2}</p>
              <a className="btn btn-outlined btn-positive" href="#todo">Map Location</a>
            </li>
          </ul>

          {promotion}

          <PostsList posts={posts} status={this.state.status} userFbId={this.props.user.fb.id} handlePostChange={this.props.handlePostChange} handleLove={this.props.handleLove} refresh={this.refresh}></PostsList>
        </div>
        <PostToolbar handlePostSubmit={this.handlePostSubmit}></PostToolbar>
      </div>
    );
  }
});

module.exports = PostsScreen;