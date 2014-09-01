/** @jsx React.DOM */

var React = require('react/addons');

var Welcome2Screen = React.createClass({
  render: function(){
    return (
      <div className="welcome transition content">
        <div className="inner_wrapper">
          <h1><span className="dwyer">Get Upped!</span></h1>
          <p>They say you&#8217;re a hero...</p>
          <img src="../img/img_welcome_placeholder_2x.png" />
          <p className="bottom_msg">Power up by finding other heroes with super powers to exchange!</p>
          <div className="bottom">
            <button className="btn" onTouchEnd={this.props.handleContinue}>Start Exploring &raquo;</button>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = Welcome2Screen;