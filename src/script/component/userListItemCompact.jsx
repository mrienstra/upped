var React = require('react/addons');

var UserListItemCompact = React.createClass({
  render: function() {
    var that = this;

    var img = this.props.user.photoURL ? <img src={this.props.user.photoURL}/> : '';

    var  handleProfileChange = function(){
      that.props.handleProfileChange(that.props.user, false, that.props.matched);
    };

    return (
      <li className="table-view-cell">
        <a className="navigate-right" onTouchEnd={handleProfileChange}>
          {img}
          <h4>{this.props.user.name}</h4>
          <p>{this.props.user.skills[0]}</p>
        </a>
      </li>
    );
  }
});

module.exports = UserListItemCompact;