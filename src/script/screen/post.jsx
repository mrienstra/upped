/** @jsx React.DOM */

var React = require('react/addons');

var CommentListItem = React.createClass({
  render: function() {
    return (
      <li className="table-view-cell">
        <img src="http://placehold.it/50x50" />
        <div className="copy">
          <h4>{this.props.name}<span className="time">{this.props.time}</span></h4>
          <p className={this.props.emotes ? 'emotes' : ''}>{this.props.emotes ? this.props.emotes : this.props.message}</p>
        </div>
      </li>
    );
  }
});

var PostSingle = React.createClass({
  render: function() {
    var that = this;
    var commentsNodes = this.props.comments.map(function (comment, index) {
      return <CommentListItem key={index} name={comment.name} time={comment.time} message={comment.message} emotes={comment.emotes} likes={comment.likes}></CommentListItem>;
    });
    return (
      <ul className="table-view flush">
        <li className="table-view-cell">
          <img src="http://placehold.it/50x50" />
          <div className="copy">
            <h4>{this.props.name}<span className="time">{this.props.time}</span></h4>
            <p>{this.props.message}</p>
            <p className="stats"><span className="icon ion-thumbsup"></span> {!this.props.likes ? 'No likes' : this.props.likes === 1 ? '1 like' : this.props.likes + ' likes'}
              <span className="icon ion-chatbubble"></span> {!this.props.commentCount ? 'No comments' : this.props.commentCount === 1 ? '1 comment' : this.props.commentCount + ' comments'}</p>
          </div>
        </li>
        <li className="table-view-cell table-view-divider">
          <div className="copy">
            <div className="buttons"><a className="btn"><span className="icon ion-thumbsup"></span> Like</a> <a className="btn"><span className="icon ion-chatbubble"></span> Comment</a> <a className="btn"><span className="icon ion-beer"></span> Gift</a></div>
          </div>
        </li>
        {commentsNodes}
      </ul>
    );
  }
});

var PostScreen = React.createClass({
  render: function() {
    return (
      <div>
        <header className="bar bar-nav">
          <a className="btn btn-link btn-nav pull-left" href="#todo" data-transition="slide-out"><span className="icon icon-left-nav"></span> Back</a>
          <a className="icon icon-compose pull-right" href="#composeModal"></a>
          <h1 className="title">Wall Post</h1>
        </header>

        <div className="bar bar-standard bar-header-secondary">
          <p><span className="icon ion-person-stalker"></span> {this.props.location}</p>
        </div>

        <div className="content">
          <PostSingle name={this.props.name} message={this.props.message} likes={this.props.likes} commentCount={this.props.commentCount} comments={this.props.comments}></PostSingle>
        </div>
      </div>
    );
  }
});

module.exports = PostScreen;