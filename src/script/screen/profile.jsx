/** @jsx React.DOM */

var React = require('react/addons');

var ProfileScreen = React.createClass({
  getInitialState: function(){
    return this.getCleanState(this.props);
  },
  getCleanState: function (props) {
    return {
      cover: props.user.cover,
      firstName: props.user.firstName,
      likes: props.user.likes,
      loading: false
    };
  },
  getProfileIfNeeded: function(){
    if (!this.props.viewingSelf) {
      var profilePromise = this.props.getProfile(this.props.user.id);
      this.handlePromise(profilePromise);
    }
  },
  handlePromise: function (profilePromise) {
    var that = this;

    profilePromise.then(
      function (user) {
        console.log('ProfileScreen profilePromise', user);

        that.setState({
          cover: user.cover,
          firstName: user.firstName,
          isPage: !!user.isPage,
          likes: user.likes,
          loading: false
        });
      },
      function (response) {
        alert('ProfileScreen profilePromise failed!');
        console.error('ProfileScreen profilePromise failed', response);

        that.setState(that.getCleanState(that.props));
      }
    );

    this.setState({loading: true});
  },
  componentWillMount: function(){
    console.log('ProfileScreen.componentWillMount()', this, arguments);

    this.getProfileIfNeeded();
  },
  componentWillReceiveProps: function (nextProps) {
    console.log('ProfileScreen.componentWillReceiveProps()', this, arguments);

    this.setState(this.getCleanState(nextProps));

    window.setTimeout(this.getProfileIfNeeded, 0);
  },
  render: function(){
    console.log('ProfileScreen.render', this);

    var leftNavButton;
    if (this.props.fromMenu) {
      leftNavButton = <a className="btn btn-link btn-nav pull-left" onTouchEnd={this.props.handleBack} data-transition="slide-out"><span className="icon icon-bars"></span></a>;
    } else {
      leftNavButton = <a className="btn btn-link btn-nav pull-left" onTouchEnd={this.props.handleBack} data-transition="slide-out"><span className="icon icon-left-nav"></span> Back</a>;
    }

    var rightNavButton;
    if (this.props.fromMenu) {
      rightNavButton = <a className="btn btn-link btn-nav pull-right" onTouchEnd={function(){alert('Coming Soon');}}>Edit</a>;
    } else {
      rightNavButton = <a className="btn btn-link btn-nav pull-right" onTouchEnd={function(){alert('Coming Soon');}}>Activity</a>;
    }

    var title;
    if (this.props.viewingSelf) {
      title = 'My Profile';
    } else if (this.state.firstName) {
      title = this.state.firstName + '’s Profile';
    } else if (this.state.isPage) {
      title = 'Page';
    } else {
      title ='Profile';
    }

    var coverImage;
    if (this.state.cover) {
      coverImage = (
        <div className="cover-image">
          <span className="icon ion-loading-d"></span>
          <img src="/img/pixel_trans_1x1.png" height="1" width="1" style={{backgroundImage: 'url(' + this.state.cover + ')'}} />
        </div>
      );
    } else if (this.state.loading) {
      coverImage = (
        <div className="cover-image">
          <span className="icon ion-loading-d"></span>
        </div>
      );
    }

    var i, l, userLikes, userLikesSection;
    l = this.state.likes && this.state.likes.length;
    if (l) {
      l = l > 6 ? 6 : l; // limit to 6
      userLikes = [];
      for (i = 0; i < l; i++) {
        userLikes.push(
          <div key={i}>
            <img src={this.state.likes[i].picture} />
            <p>{this.state.likes[i].name}</p>
          </div>
        );
      }

      userLikesSection = (
        <ul className="table-view likes-table">
          <li className="table-view-divider">Likes</li>
          <li className="table-view-cell media">
            {userLikes}
          </li>
        </ul>
      );
    } else if (this.state.isPage) {
      // Todo: show like count & allow "liking"
    }

    return (
      <div>
        <header className="bar bar-nav">
          {leftNavButton}
          {rightNavButton}
          <h1 className="title">{title}</h1>
        </header>

          <div className="content">
            <div className="overview">
              {coverImage}
              <div className="content-padded">
                <h3>{this.props.user.name}</h3>
                <h4>0 points</h4>
              </div>
            </div>
            <ul className="table-view">
              <li className="table-view-divider">Bars<span className="right">Checkins</span></li>
              <li className="table-view-cell media">Cafe Mare<span className="badge">1</span></li>
            </ul>
            {userLikesSection}
        </div>

      </div>
    );
  }
});

module.exports = ProfileScreen;