/** @jsx React.DOM */

var React = require('react/addons');

var WelcomeScreen = React.createClass({
  getInitialState: function() {
    return {
      loading: false
    };
  },
  handleLoginButton: function(){
    this.setState({loading: true});
    this.props.handleLoginButton();
  },
  render: function(){
    var loading;
    if (this.state.loading) {
      loading = <span className="icon ion-loading-d pull-right"></span>;
    }

    return (
      <div className="welcome content">
        <div className="logo"></div>
        <div className="slider" id="mySlider">
          <div className="ribbon_bg">&nbsp;</div>
          <div className="slide-group">
            <div className="slide">
              <div className="top">
                <h1><span className="dwyer">BarChat</span></h1>
                <p>The easiest way to meet<br/>new people when you go out.</p>
                <div className="slide-img slide-img1"></div>
                <p className="ribbon">Swipe to see how easy &raquo;</p>
              </div>
            </div>
            <div className="slide">
              <div className="top">
                <h2><span className="dwyer">BarChat</span></h2>
                <p>Check in to any bar.</p>
                <div className="slide-img slide-img2"></div>
                <p className="ribbon">See who&#8217;s chatting.</p>
              </div>
            </div>
            <div className="slide">
              <div className="top">
                <h2><span className="dwyer">BarChat</span></h2>
                <p>Spark a conversation.</p>
                <div className="slide-img slide-img3"></div>
                <p className="ribbon">Share text and pics.</p>
              </div>
            </div>
            <div className="slide">
              <div className="top">
                <h2><span className="dwyer">BarChat</span></h2>
                <p>Get liked, score points.</p>
                <div className="slide-img slide-img4"></div>
                <p className="ribbon">Use points for gifts!</p>
              </div>
            </div>
          </div>
        </div>
        <div className="bottom">
          <span className="arrow"></span>
          <ul className="paginator">
            <li id="slide_0" className="selected" data-slide="0"></li>
            <li id="slide_1" data-slide="1"></li>
            <li id="slide_2" data-slide="2"></li>
             <li id="slide_3" data-slide="3"></li>
          </ul>
          <button className="btn" onTouchEnd={this.handleLoginButton}>Log In with Facebook {loading}</button>
        </div>
      </div>
    );
  }
});

module.exports = WelcomeScreen;