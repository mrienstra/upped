/** @jsx React.DOM */

var React = require('react/addons');

var ProfileScreen = React.createClass({
  getInitialState: function() {
    return {};
  },
  render: function(){
    return (
      <div>
        <header className="bar bar-nav">
          <a className="btn btn-link btn-nav pull-left" onTouchEnd={this.props.handleBack} data-transition="slide-out"><span className="icon icon-bars"></span></a>
          <a className="btn btn-link btn-nav pull-right" onTouchEnd={function(){alert('Todo');}}>Edit</a>
          <h1 className="title">My Profile</h1>
        </header>

          <div className="content">
            <ul className="table-view flush free-form">
              <li className="img-wrap">
                <span className="icon ion-loading-d"></span>
                <img src="https://scontent-a-sjc.xx.fbcdn.net/hphotos-prn2/t1.0-9/5574_246045125022_213964_n.jpg" height="260" />
              </li>
              <li className="table-view-cell">
                <a href="" className="right btn btn-outlined"><span className="icon ion-ios7-chatboxes-outline"></span> activity</a>
                <h3>Erik Burns</h3>
                <h4>434 points </h4>
                <p>My hotness isn&#8217;t only between my legs. It&#8217;s inside my ear, right behind the eardrum. That&#8217;s where people come to get down!</p>
              </li>
            </ul>
            <ul className="table-view flush badge-table">
              <li className="table-view-cell table-view-divider">Bars<span className="right">Checkins</span></li>
              <li className="table-view-cell media"><a href="">The Red Room</a><span className="badge">4</span></li>
              <li className="table-view-cell media"><a href="">515 Kitchen and Cocktails</a><span className="badge">2</span></li>
              <li className="table-view-cell media"><a href="">One Double Oh Seven</a><span className="badge">1</span></li>
            </ul>
            <ul className="table-view flush likes-table">
              <li className="table-view-cell table-view-divider">Likes</li>
              <li className="table-view-cell media">
                <div>
                  <img src="https://scontent-a-sjc.xx.fbcdn.net/hphotos-prn2/t1.0-9/5574_246045125022_213964_n.jpg" />
                  <p>KiWi Time</p>
                </div>
                <div>
                  <img src="https://scontent-a-sjc.xx.fbcdn.net/hphotos-prn2/t1.0-9/5574_246045125022_213964_n.jpg" />
                  <p>Jaya Lakshmi Lakshmi</p>
                </div>
                <div>
                  <img src="https://scontent-a-sjc.xx.fbcdn.net/hphotos-prn2/t1.0-9/5574_246045125022_213964_n.jpg" />
                  <p>Patrick Roche</p>
                </div>
                <div>
                  <img src="https://scontent-a-sjc.xx.fbcdn.net/hphotos-prn2/t1.0-9/5574_246045125022_213964_n.jpg" />
                  <p>Patrick Roche</p>
                </div>
                <div>
                  <img src="https://scontent-a-sjc.xx.fbcdn.net/hphotos-prn2/t1.0-9/5574_246045125022_213964_n.jpg" />
                  <p>Patrick Roche</p>
                </div>
              </li>
            </ul>
        </div>

      </div>
    );
  }
});

module.exports = ProfileScreen;