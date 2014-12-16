var React = require('react/addons');

var InviteScreen = React.createClass({
  getInitialState: function(){
    return {
      smsNumber: void 0
    };
  },
  onInputChange: function (e) {
    var smsNumber = e.target.value.replace(/[^\d]/g,'');
    var l = smsNumber.length;
    var valid;
    if (
      (l === 11 && /1[2-9]\d\d[2-9]\d\d\d\d\d\d/.test(smsNumber))
      ||
      (l === 10 && /[2-9]\d\d[2-9]\d\d\d\d\d\d/.test(smsNumber))
      ||
      (l === 7  && /[2-9]\d\d\d\d\d\d/.test(smsNumber))
    ) {
      valid = true;
    }

    this.setState({
      smsNumber: valid ? smsNumber : void 0
    });
  },
  componentDidMount: function(){
    [].forEach.call(this.getDOMNode().getElementsByClassName('selectAll'), function (el) {
      el.addEventListener('focus', function (e) {
        this.setSelectionRange(0, 9999);
        e.preventDefault();
      });
      el.addEventListener('mouseup', function (e) {
        e.preventDefault();
      });
    });
  },
  render: function(){
    var ua = navigator.userAgent.toLowerCase();
    var seperator = (ua.indexOf('iphone') !== -1 || ua.indexOf('ipad') !== -1) ? '&' : '?'; // todo: separator was ";" in iOS <= 7?
    var url = this.state.smsNumber ? 'sms:' + this.state.smsNumber + seperator + 'body=' + encodeURIComponent('I invited you on Gather! http://www.getupped.com/') : void 0;

    var onSend = function(){
      if (url) {
        window.location = url;
      }
    };

    return (
      <div>
        <header className="bar bar-nav">
          <a className="btn btn-link btn-nav pull-left" onTouchEnd={this.props.handleBack} data-transition="slide-out"><span className="icon icon-left-nav"></span> Done</a>
          <h1 className="title">Invite</h1>
        </header>

        <div className="content" style={{paddingTop: '60px'}}>
          <label htmlFor="smsNumber">Send text to:</label>
          <input id="smsNumber" type="tel" onChange={this.onInputChange} placeholder="111-222-3333" />
          <button id="send" onClick={onSend} disabled={!this.state.smsNumber}>Send</button>
          <hr />
          <p>Not working for you? You can also copy &amp; paste the following into an SMS:</p>
          <textarea className="selectAll" value="I invited you on Gather! http://www.getupped.com/" readOnly />
        </div>

      </div>
    );
  }
});

module.exports = InviteScreen;