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

        <div className="scroll-content overflow-scroll has-header">

          <iframe className="fullframe" src="http://www.paywithsushi.com/how-it-works"></iframe>
        </div>
      </div>
    );
  }
});

module.exports = FeedbackScreen;