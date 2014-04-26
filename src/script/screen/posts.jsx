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
            <p className="stats"><span className="icon ion-thumbsup"></span> {!this.props.likes ? 'No likes' : this.props.likes === 1 ? '1 like' : this.props.likes + ' likes'}
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

var PostsScreen = React.createClass({
  getInitialState: function() {
    return {status: 'init'};
  },
  componentWillMount: function() {
    var that = this;
    this.setState({status: 'loading'});

    this.props.getPostsAsync(
      function(posts){
        console.log('PostsScreen.componentWillMount getPostsAsync', posts);

        that.setState({status: 'loaded'});
        that.setProps({posts: posts});
      },
      function(response){
        alert('PostsScreen.componentWillMount getPostsAsync call failed!');
        console.warn('bad', response);

        that.setState({status: 'loaded'});
        that.setProps({posts: []});
      }
    );
  },
  render: function() {
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

    return (
      <div>
        <header className="bar bar-nav">
          <a className="btn btn-link btn-nav pull-left" onTouchEnd={this.props.handleLocationsChange} data-transition="slide-out"><span className="icon icon-left-nav"></span> Back</a>
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

          <PostsList posts={this.props.posts} status={this.state.status} handlePostChange={this.props.handlePostChange}></PostsList>
        </div>
      </div>
    );
  }
});

module.exports = PostsScreen;