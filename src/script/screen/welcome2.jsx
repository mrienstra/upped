var React = require('react/addons');

var Welcome2Screen = React.createClass({
  render: function(){
    return (
      <div className="welcome transition content">
        <div className="inner_wrapper">
          <h1><span className="dwyer">Get Upped!</span></h1>
          <p>Ready to play?</p>
          <img src="../img/button_yes_big_2x.png" />
          <p className="bottom_msg">
          Just tap the star for any super hero you want to connect with!</p>
          <p className="bottom_msg2">
          We've gathered together profiles of super talented humans like you.
          To play, just browse profiles and tap the star on anyone's profile will skills or a service you need.
          If there's a mutual match, we'll connect you!</p>
          <div className="bottom">
            <button className="btn" onTouchEnd={this.props.handleContinue}>Start Exploring &raquo;</button>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = Welcome2Screen;