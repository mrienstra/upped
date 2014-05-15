/** @jsx React.DOM */

var React = require('react/addons');
var moment = require('moment');

var CommentListItem = React.createClass({
  render: function() {
    return (
      <li className="table-view-cell posts-list">
        <div className="details">
          <img src={this.props.from.picture} />
          <h4>{this.props.from.name}</h4>
          <div className="time">{moment(this.props.time).fromNow()}</div>
        </div>
        <div className="copy">
          <p>{this.props.message}</p>
        </div>
      </li>
    );
  }
});

var PostSingle = React.createClass({
  render: function() {
    var that = this;

    var likeCount = this.props.likes ? this.props.likes.length : '';

    var userLoves = this.props.likes && this.props.likes.some(function (like) {
      return like.id === that.props.user.fbId;
    });
    var heartClasses = userLoves ? 'icon ion-ios7-heart' : 'icon ion-ios7-heart-outline';

    var commentCount = this.props.comments.length;

    var commentsNodes = this.props.comments.map(function (comment, index) {
      return <CommentListItem key={index} from={comment.from} time={comment.time} message={comment.message} likes={comment.likes} liked={comment.liked}></CommentListItem>;
    });
    return (
      <ul className="table-view posts-list">
        <li className="table-view-cell">
          <img className="fullWidth" src={this.props.post.picture} />
          <div className="details">
            <img src={this.props.from.picture} />
            <h4>{this.props.from.name}</h4>
            <div className="time">{moment(this.props.time).fromNow()}</div>
            <div className="stats"><span className="likes"><span className="count">{likeCount}</span><span className={heartClasses}></span></span>
              <span className="comments"><span className="count">{commentCount ? commentCount : ' '}</span><span className="icon ion-ios7-chatboxes-outline"></span></span></div>
          </div>
          <div className="copy">
            <p className={this.props.post.story ? 'emotes' : ''}>{this.props.post.story ? this.props.post.story : this.props.post.message}</p>
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
          <p>{this.props.location}</p>
        </div>

        <div className="content">
          <PostSingle from={this.props.from} time={this.props.time} post={this.props.post} likes={this.props.likes} comments={this.props.comments} user={this.props.user}></PostSingle>
        </div>
      </div>
    );
  }
});

module.exports = PostScreen;