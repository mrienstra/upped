/** @jsx React.DOM */

var React = require('react/addons');

var ProfileScreen = React.createClass({
  render: function(){
    var i, l, userLikes;

    var viewingSelf = this.props.user.fb.id === this.props.viewingUser.fb.id;

    var title = viewingSelf ? 'My Profile' : this.props.user.firstName + '’s Profile';

    l = this.props.user.fb.likes && this.props.user.fb.likes.length;
    if (l) {
      l = l > 5 ? 5 : l; // limit to 5
      userLikes = [];
      for (i = 0; i < l; i++) {
        userLikes.push(
          <div key={i}>
            <img src={this.props.user.fb.likes[i].picture} />
            <p>{this.props.user.fb.likes[i].name}</p>
          </div>
        );
      }
    }

    return (
      <div>
        <header className="bar bar-nav">
          <a className="btn btn-link btn-nav pull-left" onTouchEnd={this.props.handleBack} data-transition="slide-out"><span className="icon icon-bars"></span></a>
          <a className="btn btn-link btn-nav pull-right" onTouchEnd={function(){alert('Todo');}}>Edit</a>
          <h1 className="title">{title}</h1>
        </header>

          <div className="content">
            <ul className="table-view flush free-form">
              <li className="img-wrap">
                <span className="icon ion-loading-d"></span>
                <img src={this.props.user.cover} height="260" />
              </li>
              <li className="table-view-cell">
                <a href="" className="right btn btn-outlined"><span className="icon ion-ios7-chatboxes-outline"></span> activity</a>
                <h3>{this.props.user.name}</h3>
                <h4>434 points</h4>
                <p>My hotness isn&#8217;t only between my legs. It&#8217;s inside my ear, right behind the eardrum. That&#8217;s where people come to get down!</p>
              </li>
            </ul>
            <ul className="table-view flush badge-table">
              <li className="table-view-cell table-view-divider">Bars<span className="right">Checkins</span></li>
              <li className="table-view-cell media"><a href="">The Red Room</a><span className="badge">4</span></li>
              <li className="table-view-cell media"><a href="">515 Kitchen and Cocktails</a><span className="badge">2</span></li>
              <li className="table-view-cell media"><a href="">One Double Oh Seven</a><span className="badge">1</span></li>
            </ul>
            <ul className="table-view flush likes-table">
              <li className="table-view-cell table-view-divider">Likes</li>
              <li className="table-view-cell media">
                {userLikes}
              </li>
            </ul>
        </div>

      </div>
    );
  }
});

module.exports = ProfileScreen;