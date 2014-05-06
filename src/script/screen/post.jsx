/** @jsx React.DOM */

var React = require('react/addons');
var moment = require('moment');

var CommentListItem = React.createClass({
  render: function() {
    return (
      <li className="table-view-cell">
        <img src={this.props.from.picture} />
        <div className="copy">
          <h4>{this.props.from.name}<span className="time">{moment(this.props.time).fromNow()}</span></h4>
          <p>{this.props.message}</p>
        </div>
      </li>
    );
  }
});

var PostSingle = React.createClass({
  render: function() {
    var that = this;

    var commentCount = this.props.comments.length;

    var commentsNodes = this.props.comments.map(function (comment, index) {
      return <CommentListItem key={index} from={comment.from} time={comment.time} message={comment.message} likes={comment.likes} liked={comment.liked}></CommentListItem>;
    });
    return (
      <ul className="table-view flush">
        <li className="table-view-cell">
          <img className="fullWidth" src={this.props.post.picture} />
          <img src={this.props.from.picture} />
          <div className="copy">
            <h4>{this.props.from.name}<span className="time">{moment(this.props.time).fromNow()}</span></h4>
           <p className={this.props.post.story ? 'emotes' : ''}>{this.props.post.story ? this.props.post.story : this.props.post.message}</p>
            <p className="stats"><span className="icon ion-heart"></span> {!this.props.likes ? 'No likes' : this.props.likes === 1 ? '1 like' : this.props.likes + ' likes'}
              <span className="icon ion-chatbubble"></span> {!commentCount ? 'No comments' : commentCount === 1 ? '1 comment' : commentCount + ' comments'}</p>
          </div>
        </li>
        <li className="table-view-cell table-view-divider">
          <div className="copy">
            <div className="buttons"><a className="btn"><span className="icon ion-heart"></span> Like</a> <a className="btn"><span className="icon ion-chatbubble"></span> Comment</a> <a className="btn"><span className="icon ion-beer"></span> Gift</a></div>
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
          <a className="btn btn-link btn-nav pull-left" onTouchEnd={this.props.handleBack} data-transition="slide-out"><span className="icon icon-left-nav"></span> Back</a>
          <a className="icon icon-compose pull-right" href="#composeModal"></a>
          <h1 className="title">Wall Post</h1>
        </header>

        <div className="bar bar-standard bar-header-secondary">
          <p><span className="icon ion-person-stalker"></span> {this.props.location}</p>
        </div>

        <div className="content">
          <PostSingle from={this.props.from} time={this.props.time} post={this.props.post} likes={this.props.likes} comments={this.props.comments}></PostSingle>
        </div>
      </div>
    );
  }
});

module.exports = PostScreen;