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
          <h1 className="title">PAY WITH SUSHI</h1>
        </div>

        <div className="scroll-content overflow-scroll has-header">

          <div className="list list-inset-dotted">
            <div className="item item-text-wrap center">
              <h1>Feedback</h1>
              <img src="img/new_logo_dark.png"/>
              <h2>How's the smartest way to pay since the bank roll?</h2>
            </div>
            <div className="item item-text-wrap center">
              <h4>This is a new limited release app, and we want your feedback. Let us know what you think!</h4>
              <div className="padding">
                <button className="button button-assertive">
                  Feedback
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = FeedbackScreen;