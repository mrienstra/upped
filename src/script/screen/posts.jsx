/** @jsx React.DOM */

var React = require('react/addons');
var moment = require('moment');

var PostsListItem = React.createClass({
  render: function() {
    var commentCount = this.props.comments.length;

    return (
      <li className="table-view-cell">
        <a onTouchEnd={this.props.handlePostChange.bind(null, this.props)}>
          <div className="details">
            <img src={this.props.from.picture} />
            <h4>{this.props.from.name}</h4>
            <div className="time">{moment(this.props.time).fromNow()}</div>
            <div className="stats"><span className="likes"><span className="count">{this.props.likes}</span><span className="icon ion-ios7-heart-outline"></span></span>
              <span className="comments"><span className="count">{commentCount ? commentCount : ' '}</span><span className="icon ion-ios7-chatboxes-outline"></span></span></div>
          </div>
          <div className="copy">
            <p className={this.props.post.story ? 'emotes' : ''}>{this.props.post.story ? this.props.post.story : this.props.post.message}</p>
          </div>
        </a>
      </li>
    );
  }
});

var PostsList = React.createClass({
  render: function() {
    var that = this;
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
        return <PostsListItem key={index} handlePostChange={that.props.handlePostChange} from={post.from} time={post.time} post={post.post} likes={post.likes} comments={post.comments}></PostsListItem>;
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
  componentDidMount: function() {
    var thisDOMNode, textareaSize, input;

    thisDOMNode = this.getDOMNode();
    textareaSize = thisDOMNode.querySelector('.textarea-size');
    input = thisDOMNode.querySelector('textarea');

    this.autoSize = function () {
      textareaSize.innerHTML = input.value + '\n';
    };

    this.autoSize();
  },
  render: function() {
    return (
      <div className="bar bar-standard bar-footer">
        <div className="left">
          <a className="icon ion-camera" onTouchEnd={function(){alert('Todo');}}></a>
        </div>
        <div className="right">
          <a onTouchEnd={this.props.handleCreatePost.bind(this)}>Post</a>
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
  getInitialState: function() {
    return {
      status: 'loading',
      posts: []
    };
  },
  handleDeferred: function (postsDeferred) {
    var that = this;
    postsDeferred.then(
      function(posts){
        console.log('PostsScreen postsDeferred', posts);

        that.setState({
          status: 'loaded',
          posts: posts
        });
      },
      function(response){
        alert('PostsScreen postsDeferred failed!');
        console.warn('bad', response);

        that.setState({
          status: 'loaded',
          posts: []
        });
      }
    );
  },
  componentWillMount: function(){
    console.log('PostsScreen.componentWillMount()', this, arguments);

    this.handleDeferred(this.props.postsDeferred);
  },
  componentWillReceiveProps: function (nextProps) {
    console.log('PostsScreen.componentWillReceiveProps()', this, arguments);

    this.setState({
      status: 'loading',
      posts: []
    });

    this.handleDeferred(nextProps.postsDeferred);
  },
  render: function() {
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
          <a className="icon ion-search pull-right" onTouchEnd={this.props.handleCreatePost.bind(null, this.props)}></a>
          <h1 className="title">{this.props.name}</h1>
        </header>

        <div className="bar bar-standard bar-header-secondary">
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

          <PostsList posts={posts} status={this.state.status} handlePostChange={this.props.handlePostChange}></PostsList>
        </div>
        <PostToolbar fbId={this.props.fbId} handleCreatePost={this.props.handleCreatePost}></PostToolbar>
      </div>
    );
  }
});

module.exports = PostsScreen;