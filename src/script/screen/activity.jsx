/** @jsx React.DOM */

var React = require('react/addons');

// Modules
var pubSub = require('../pubSub.js');
var utils = require('../utils.js');

// Components
var UserListItemCompact = require('../component/userListItemCompact.jsx');

var MatchesList = React.createClass({
  render: function(){
    var props = this.props;

    var matchesNodes;
    if (this.props.status === 'loading') {
      matchesNodes = (
        <li className="table-view-cell loading"><p><span className="icon ion-ios7-reloading"></span> Loading...</p></li>
      );
    } else if (!this.props.matches || this.props.matches.length === 0) {
      matchesNodes = (
        <li className="table-view-cell"><p><span className="icon ion-eye-disabled"></span> Nothing to see here.</p></li>
      );
    } else {
      matchesNodes = this.props.matches.map(function (match, index) {
        return <UserListItemCompact key={index} user={match} handleProfileChange={props.handleProfileChange} />;
      });
    }
    return (
      <ul className="table-view matches-list">
        {matchesNodes}
      </ul>
    );
  }
});

var MatchesScreen = React.createClass({
  getInitialState: function(){
    return {
      status: 'loading',
      matches: []
    };
  },
  handlePromise: function (matchesPromise, options) {
    var that = this;

    if (!options || !options.quietStart) {
      this.setState({
        status: 'loading',
        matches: []
      });
    }

    matchesPromise.then(
      function(matches){
        console.log('MatchesScreen matchesPromise', matches);

        that.setState({
          status: 'loaded',
          matches: matches
        });

        pubSub.publish('matches.seenOrTotal', {count: {seen: matches.length, total: matches.length}});
      },
      function(response){
        alert('MatchesScreen matchesPromise failed!');
        console.warn('bad', response);

        that.setState({
          status: 'loaded',
          matches: []
        });
      }
    );
  },
  refresh: function(){
    console.log('MatchesScreen.refresh()', this, arguments);

    var matchesPromise = this.props.getMatches();

    this.handlePromise(matchesPromise, {quietStart: true});
  },
  componentWillMount: function(){
    console.log('MatchesScreen.componentWillMount()', this, arguments);

    var matchesPromise = this.props.getMatches();

    this.handlePromise(matchesPromise);
  },
  componentWillReceiveProps: function (nextProps) {
    console.log('MatchesScreen.componentWillReceiveProps()', this, arguments);

    var matchesPromise = nextProps.getMatches();

    this.handlePromise(matchesPromise);
  },
  render: function(){
    console.log('MatchesScreen.render()', this, arguments);

    var leftNavButton;
    if (this.props.fromMenu) {
      leftNavButton = <a className="btn btn-link btn-nav pull-left" onTouchEnd={this.props.handleBack} data-transition="slide-out"><span className="icon icon-bars"></span></a>;
    } else {
      leftNavButton = <a className="btn btn-link btn-nav pull-left" onTouchEnd={this.props.handleBack} data-transition="slide-out"><span className="icon icon-left-nav"></span> Back</a>;
    }

    return (
      <div>
        <header className="bar bar-nav solid">
          {leftNavButton}
          <h1 className="title">Matches</h1>
        </header>

        <div className="content">

          <MatchesList matches={this.state.matches} status={this.state.status} handleProfileChange={this.props.handleProfileChange} />

        </div>
      </div>
    );
  }
});

module.exports = MatchesScreen;