/** @jsx React.DOM */

var React = require('react/addons');
var moment = require('moment');

var PostsListItem = React.createClass({
  render: function() {
    var commentCount = this.props.comments.length;

    return (
      <li className="table-view-cell">
        <a className="navigate-right" onTouchEnd={this.props.handlePostChange.bind(null, this.props)}>
          <img src={this.props.from.picture} />
          <div className="copy">
            <h4>{this.props.from.name}<span className="time">{moment(this.props.time).fromNow()}</span></h4>
            <p className={this.props.post.story ? 'emotes' : ''}>{this.props.post.story ? this.props.post.story : this.props.post.message}</p>
            <p className="stats"><span className="icon ion-heart"></span> {!this.props.likes ? 'No likes' : this.props.likes === 1 ? '1 like' : this.props.likes + ' likes'}
              <span className="icon ion-chatbubble"></span> {!commentCount ? 'No comments' : commentCount === 1 ? '1 comment' : commentCount + ' comments'}</p>
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
        <ul className="table-view">
          <li className="table-view-cell table-view-divider">Recent Activity</li>
          {postsNodes}
        </ul>
    );
  }
});

var PostToolbar = React.createClass({
  componentDidMount: function() {
    var textContainer, textareaSize, input;
    var autoSize = function () {
      textareaSize.innerHTML = input.value + '\n';
    };
    barFooter = document.querySelector('.bar-footer');
    textContainer = barFooter.querySelector('.textarea-container');
    textareaSize = barFooter.querySelector('.textarea-size');
    input = barFooter.querySelector('textarea');

    autoSize();
    input.addEventListener('input', autoSize);
  },
  render: function() {
    return (
      <div className="bar bar-standard bar-footer">
    		<div className="left">
    	  	<a className="icon ion-camera" href="#"></a>
    		</div>
    		<div className="right">
    	  	<a href="#">Post</a>
    		</div>
    		<div className="center textarea-container">
    		  <textarea placeholder="What are you up to?"></textarea>
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
          <a className="icon icon-compose pull-right" onTouchEnd={this.props.handleCreatePost.bind(null, this.props)}></a>
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
        <PostToolbar></PostToolbar>
      </div>
    );
  }
});

module.exports = PostsScreen;