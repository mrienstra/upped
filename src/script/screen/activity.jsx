/** @jsx React.DOM */

var React = require('react/addons');

// Modules
var pubSub = require('../pubSub.js');
var utils = require('../utils.js');

var ActivitiesListItem = React.createClass({
  render: function(){
    var story = this.props.activity.story;
    if (this.props.user.name === this.props.activity.actor.name) {
      // Todo: change <First Last> to "You"?
    }

    return (
      <li className="table-view-cell">
        <a>
          <div className="details">
            <div className="time">{utils.momentFromNowIfTime(this.props.activity.time)}</div>
          </div>
          <div className="copy">
            <p className="emotes">{story}</p>
          </div>
        </a>
      </li>
    );
  }
});

var ActivitiesList = React.createClass({
  render: function(){
    var props = this.props;

    var activitiesNodes;
    if (this.props.status === 'loading') {
      activitiesNodes = (
        <li className="table-view-cell loading"><p><span className="icon ion-ios7-reloading"></span> Loading...</p></li>
      );
    } else if (!this.props.activities || this.props.activities.length === 0) {
      activitiesNodes = (
        <li className="table-view-cell"><p><span className="icon ion-eye-disabled"></span> Nothing to see here.</p></li>
      );
    } else {
      activitiesNodes = this.props.activities.map(function (activity, index) {
        return <ActivitiesListItem key={index} user={props.user} activity={activity} />;
      });
    }
    return (
      <ul className="table-view posts-list">
        {activitiesNodes}
      </ul>
    );
  }
});

var ActivityScreen = React.createClass({
  getInitialState: function(){
    return {
      status: 'loading',
      activities: []
    };
  },
  handlePromise: function (activityPromise, options) {
    var that = this;

    if (!options || !options.quietStart) {
      this.setState({
        status: 'loading',
        activities: []
      });
    }

    activityPromise.then(
      function(activities){
        console.log('ActivityScreen activityPromise', activities);

        that.setState({
          status: 'loaded',
          activities: activities
        });

        pubSub.publish('activity.seenOrTotal', {count: {seen: activities.length, total: activities.length}});
      },
      function(response){
        alert('ActivityScreen activityPromise failed!');
        console.warn('bad', response);

        that.setState({
          status: 'loaded',
          activities: []
        });
      }
    );
  },
  refresh: function(){
    var activityPromise = this.props.getActivity();

    this.handlePromise(activityPromise, {quietStart: true});
  },
  componentWillMount: function(){
    console.log('ActivityScreen.componentWillMount()', this, arguments);

    var activityPromise = this.props.getActivity();

    this.handlePromise(activityPromise);
  },
  componentWillReceiveProps: function (nextProps) {
    console.log('ActivityScreen.componentWillReceiveProps()', this, arguments);

    var activityPromise = nextProps.getActivity();

    this.handlePromise(activityPromise);
  },
  render: function(){
    console.log('ActivityScreen.render()', this, arguments);

    return (
      <div>
        <header className="bar bar-nav">
          <a className="btn btn-link btn-nav pull-left" onTouchEnd={this.props.handleBack} data-transition="slide-out"><span className="icon icon-bars"></span></a>
          <h1 className="title">Activity</h1>
        </header>

        <div className="content">

          <ActivitiesList user={this.props.user} activities={this.state.activities} status={this.state.status} />

        </div>
      </div>
    );
  }
});

module.exports = ActivityScreen;