var React = require('react');

// Libs
var classNames = require('classnames');

// Mixins
var ScreenTransitionMixin = require('../mixin/screenTransition.js');

var FeedbackScreen = React.createClass({
  mixins: [ScreenTransitionMixin],
  propTypes: {
    showSideMenu: React.PropTypes.func,
    handleBack: React.PropTypes.func,
    visible: React.PropTypes.bool.isRequired,
  },
  render: function(){
    var leftNavButton;
    if (this.props.fromMenu) {
      leftNavButton = <button className="button button-icon icon ion-navicon" onTouchEnd={this.props.showSideMenu}></button>;
    } else {
      leftNavButton = <button className="button button-icon icon ion-chevron-left" onTouchEnd={this.props.handleBack}></button>;
    }

    return (
      <div className={classNames.apply(null, this.state.classNames)}>
        <div className="bar-stable bar bar-header nav-bar disable-user-behavior">
          <div className="buttons left-buttons">
            <div>
              {leftNavButton}
            </div>
          </div>
          <h1 className="title">How it Works</h1>
        </div>

        <div className="scroll-content overflow-scroll has-header padding howitworks">
          <h3>How Does Pay with Sushi Work?</h3>
          <p>Pay with Sushi is a mobile payment platform that lets you pay for the stuff your business needs with your goods and services.
          We connect you with great local businesses, keep track of who owes who and have your back if anything goes wrong. Here&#8217;s how it works:</p>
          <ol>
            <li>
              <h4><div className="counter">1</div>Swipe through local businesses to find a match</h4>
              <img src="http://static1.squarespace.com/static/552367eae4b0fb7c9860d7af/t/55a6db3ce4b0a494fbb3aa27/1436999778654/" alt="Step one" />
              <p>There are 1000&#8217;s of great businesses near you on Pay with Sushi &mdash;
              web designers, plumbers, photographers, massage therapists, yoga teachers, even sumo masters.
              Swipe through their profiles and when you find one that has something you want, just click &#8220;want&#8221;.
              We&#8217;ll let you know when there&#8217;s a match!</p>
            </li>
            <li>
              <h4><div className="counter">2</div>Agree on the value of the exchange</h4>
              <img src="http://static1.squarespace.com/static/552367eae4b0fb7c9860d7af/t/55a6db3ce4b0a494fbb3aa28/1435988371661/" alt="Step two" />
              <p>Buying massages with yoga privates? Tango lessons with photography? Sushi dinners with Kung Fu?
              Once you&#8217;ve found a match, just settle on the cash value you want to exchange and hit confirm.
              We&#8217;ll issue you a credit to their store and vice versa.</p>
            </li>
            <li>
              <h4><div className="counter">3</div>Track it like cash</h4>
              <img src="http://static1.squarespace.com/static/552367eae4b0fb7c9860d7af/t/55a6db3ce4b0a494fbb3aa29/1435990231806/" alt="Step three" />
              <p>We keep track of everything for you.
              Check in to our app any time to see how much credit you have remaining, redeem offers, and track payment activity.
              Simple.</p>
            </li>
          </ol>
          <hr/>
          <h3>We&#8217;ve Got You Covered!</h3>
          <p className="center">Have questions? Shoot us an email and a real live person will get back to you directly.<br/>
          <a href="mailto:sushi@paywithsushi.com">sushi@paywithsushi.com</a></p>
        </div>
      </div>
    );
  }
});

module.exports = FeedbackScreen;