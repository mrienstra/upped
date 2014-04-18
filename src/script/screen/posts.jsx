/** @jsx React.DOM */

var React = require('react/addons');

var PostsListItem = React.createClass({
  render: function() {
    return (
      <li className="table-view-cell">
        <a className="navigate-right" onClick={this.props.handlePostChange}>
          <img src="http://placehold.it/50x50" />
          <div className="copy">
            <h4>{this.props.name}<span className="time">{this.props.time}</span></h4>
            <p>{this.props.message}</p>
            <p className="stats"><span className="icon ion-thumbsup"></span> {!this.props.likes ? 'No likes' : this.props.likes === 1 ? '1 like' : this.props.likes + ' likes'}
              <span className="icon ion-chatbubble"></span> {!this.props.comments ? 'No comments' : this.props.comments === 1 ? '1 comment' : this.props.comments + ' comments'}</p>
          </div>
        </a>
      </li>
    );
  }
});

var PostsList = React.createClass({
  render: function() {
    var that = this;
    var postsNodes = this.props.posts.map(function (post, index) {
      return <PostsListItem key={index} handlePostChange={that.props.handlePostChange} name={post.name} time={post.time} message={post.message} likes={post.likes} comments={post.comments}></PostsListItem>;
    });
    return (
        <ul className="table-view">
          <li className="table-view-cell table-view-divider">Recent Activity</li>
          {postsNodes}
        </ul>
    );
  }
});

var PostsScreen = React.createClass({
  render: function() {
    return (
      <div>
        <header className="bar bar-nav">
          <a className="btn btn-link btn-nav pull-left" href="#todo" data-transition="slide-out"><span className="icon icon-left-nav"></span> Back</a>
          <a className="icon ion-log-in pull-right" href="#todo"></a>
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
            <li className="table-view-cell table-view-divider">{this.props.promotion.title}</li>
            <li className="table-view-cell media">
              <a href="" data-transition="slide-in">
              <p className="navigate-right"><span className="icon ion-beer"></span> {this.props.promotion.message}</p>
              </a>
            </li>
          </ul>

          <PostsList posts={this.props.posts} handlePostChange={this.props.handlePostChange}></PostsList>
        </div>
      </div>
    );
  }
});

module.exports = PostsScreen;