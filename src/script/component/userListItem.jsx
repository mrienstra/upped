/** @jsx React.DOM */

var React = require('react/addons');

// Modules
var pubSub = require('../pubSub.js');

var UserListItem = React.createClass({
  getInitialState: function(){
    return {
      expanded: !!this.props.fromMenu
    };
  },
  componentWillMount: function(){
    pubSub.unsubscribe('toggleDataUserListItem.' + this.props.key, this.handleToggleDetails);
    pubSub.subscribe('toggleDataUserListItem.' + this.props.key, this.handleToggleDetails);
  },
  handleToggleDetails: function(){
    if (!this.props.fromMenu) {
      console.log('pubsub.subscribe toggleDataUserListItem.' + this.props.key + ' handleToggleDetails', this.state.expanded);

      pubSub.publish('heroes.toggleButtons', {expanded: !this.state.expanded});

      this.setState({expanded: !this.state.expanded});
    } else {
      console.log('pubsub.subscribe toggleDataUserListItem.' + this.props.key + ' handleToggleDetails, ignoring because this.props.fromMenu', this.props.fromMenu);
    }
  },
  render: function() {
    var img = this.props.user.photoURL ? <img src={this.props.user.photoURL}/> : '';

    var skills = this.props.user.skills.map(function (name) {
      return <li>{name}</li>;
    });

    var nominations = this.props.user.nominations.map(function (nomination) {
      return (
        <li>
          <img/>
          <h5>{nomination.name}</h5>
          <span className="skill">{nomination.skill}</span>
          <p>{nomination.text}</p>
        </li>
      );
    });

    return (
      <div className="userListItem" onTouchEnd={this.handleToggleDetails}>
        {img}
        <div className={'summary' + (this.state.expanded ? ' hide' : '')}>
          <div className="nameAndSkillCount">{this.props.user.name}</div>
          <div className="statement">{this.props.user.statement}</div>
        </div>
        <div className={'details' + (this.state.expanded ? ' show' : '')}>
          <div className="nameAndSkillCount">{this.props.user.name}</div>
          <div className="statement">{this.props.user.statement}</div>
          <div className="distance hide">{this.props.user.distance}</div>
          <div className="location">{this.props.user.location}</div>
          <div className="skills">
            <h4><span className="icon ion-ios7-bolt"></span> Super Powers</h4>
            <ul>
              {skills}
            </ul>
          </div>
          <div className="nominations">
            <h4><span className="icon ion-ribbon-b"></span> Hero Nominations</h4>
            <ul>
              {nominations}
            </ul>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = UserListItem;