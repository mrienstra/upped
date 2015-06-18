var React = require('react');

// Libs
var classNames = require('classnames');

// Mixins
var ScreenTransitionMixin = require('../mixin/screenTransition.js');

var FeedbackScreen = React.createClass({
  mixins: [ScreenTransitionMixin],
  render: function(){
    return (
      <div className={classNames.apply(null, this.state.classNames)}>
        <div className="bar-stable bar bar-header nav-bar disable-user-behavior">
          <div className="buttons left-buttons">
            <div>
              <button className="button button-icon icon ion-navicon" onTouchEnd={this.props.showSideMenu}></button>
            </div>
          </div>
          <h1 className="title">Feedback</h1>
        </div>

        <div className="scroll-content overflow-scroll has-header">

          <h2 className="center">
            We &#9825; You
          </h2>
          <h4 className="center">
            How some ideas, problems, or questions? This is a new release, and we want your feedback. Text or call: 831.607.9007
          </h4>
          <p className="center"><a className="button button-assertive" href="sms://831.607.9007?body=Pay%20With%20Sushi%20feedback:%20">Send Us a Text</a></p>
          <p className="center"><a className="button button-assertive" href="tel:831.607.9007">Give Us a Call</a></p>
        </div>
      </div>
    );
  }
});

module.exports = FeedbackScreen;