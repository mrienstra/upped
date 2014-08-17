/** @jsx React.DOM */

var React = require('react/addons');

var UserListItem = React.createClass({
  getInitialState: function(){
    return {
      expanded: this.props.fromMenu
    };
  },
  render: function() {
    console.log('this.props', this.props);

    var that = this;

    var handleToggleDetails = function(){
      if (!that.props.fromMenu) {
        that.setState({expanded: !that.state.expanded});
      }
    };

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
      <div className="userListItem" onTouchEnd={handleToggleDetails}>
        {img}
        <div className={'summary' + (this.state.expanded ? ' hide' : '')}>
          <div className="nameAndSkillCount">{this.props.user.name}<span className="count icon ion-ios7-bolt"> {this.props.user.skills.length}</span></div>
          <div className="statement">{this.props.user.statement}</div>
        </div>
        <div className={'details' + (this.state.expanded ? ' show' : '')}>
          <div className="nameAndSkillCount">{this.props.user.name}, {this.props.user.age}<span className="count icon ion-ios7-bolt"> {this.props.user.skills.length}</span></div>
          <div className="distance">{this.props.user.distance}</div>
          <div className="location">{this.props.user.location}</div>
          <div className="statement">{this.props.user.statement}</div>
          <div className="skills">
            <h4><span className="icon ion-ios7-bolt"></span> Super Powers:<span className="count">{this.props.user.skills.length}</span></h4>
            <ul>
              {skills}
            </ul>
          </div>
          <div className="nominations">
            <h4><span className="icon ion-ribbon-b"></span> Hero Nominations:<span className="count">{this.props.user.nominations.length}</span></h4>
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