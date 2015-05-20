var React = require('react/addons');

// Data
var categories = require('../data/categories.js');

// Libs
var _ = require('lodash');

// Mixins
var ScreenTransitionMixin = require('../mixin/screenTransition.js');

var ProfileEditScreen = React.createClass({
  mixins: [ScreenTransitionMixin],
  editableProperties: ['name', 'statement', 'location', 'skills'],
  getInitialState: function() {
    if (this.props.userData) {
      return this.transferEditablePropsToStateObj(this.props.userData);
    } else {
      return {};
    }
  },
  componentWillReceiveProps: function (nextProps) {
    if (nextProps.userData) {
      this.setState(this.transferEditablePropsToStateObj(nextProps.userData));
    }
  },
  transferEditablePropsToStateObj: function (props) {
    var that = this;
    var stateObj = {};
    this.editableProperties.forEach(function (prop) {
      stateObj[prop] = props[prop];
    });

    return stateObj;
  },
  updateUserDataSkills: function (userDataSkills) {
    this.setState({skills: userDataSkills});
  },
  handleDone: function (e) {
    var that = this;
    var modifiedUserData = {};
    var dirty = false;

    this.editableProperties.forEach(function (prop) {
      if (that.state[prop] !== that.props.userData[prop]) {
        modifiedUserData[prop] = that.state[prop];
        dirty = true;
      }
    });

    if (dirty) {
      this.props.saveUserDataChanges(modifiedUserData);
    }

    this.props.handleBack(e);
  },
  onChange: function (e) {
    console.log('onChange', this, arguments);
    if (e.target.classList.contains('name')) {
      this.setState({name: e.target.value.substr(0, 48)});
    } else if (e.target.parentNode.classList.contains('statement')) {
      this.setState({statement: e.target.value.substr(0, 140)});
    } else if (e.target.parentNode.classList.contains('location')) {
      this.setState({statement: e.target.value.substr(0, 48)});
    } else if (e.target.parentNode.parentNode.parentNode.classList.contains('skills')) {
      var editedSkills = this.state.skills.concat();
      var skillIndex = [].indexOf.call(e.target.parentNode.parentNode.childNodes, e.target.parentNode);
      if (skillIndex !== -1) {
        editedSkills[skillIndex] = e.target.value.substr(0, 48);
        this.setState({skills: editedSkills});
      } else {
        console.error('WTF', this, arguments);
      }
    }
  },
  deleteSkill: function (e) {
    var editedSkills = this.state.skills.concat();
    var skillIndex = [].indexOf.call(e.target.parentNode.parentNode.childNodes, e.target.parentNode);
    if (skillIndex !== -1) {
      console.log('deleteSkill', skillIndex, editedSkills[skillIndex]);
      editedSkills.splice(skillIndex, 1);
      this.setState({skills: editedSkills});
    } else {
      console.error('WTF', this, arguments);
    }
  },
  addSkill: function(){
    console.log('addSkill');
    this.props.handleSelectSkillsChange(this.state.skills, this.updateUserDataSkills);
    /*var editedSkills = this.state.skills.concat();
    editedSkills.push('');
    this.setState({skills: editedSkills});*/
  },
  render: function(){
    console.log('ProfileEditScreen.render', this);
    var that = this;

    if (!this.props.userData) {
      return (
        <div className={React.addons.classSet.apply(null, this.state.classNames)}>
          <span className="icon ion-loading-d"></span>
        </div>
      );
    }

    var img = this.props.userData.photoURL ? <img src={this.props.userData.photoURL}/> : '';

    var skills;
    if (this.state.skills && this.state.skills.length) {
      skills = this.state.skills.map(function (name, i) {
        var category;
        if (name === parseInt(name.toString()) && (category = _.find(categories, {id: name}))) {
          name = category.name;
        }

        var deleteButton;
        if (that.state.skills.length > 1) {
          deleteButton = <span className="delete icon icon-close" onTouchEnd={that.deleteSkill}/>;
        }
        return <li key={i}><input type="text" value={name} onChange={that.onChange}/>{deleteButton}</li>;
      });

      if (skills.length < 5) {
        skills.push(
          <li key={skills.length} onTouchEnd={that.addSkill}><span className="icon icon-plus"></span> Add</li>
        );
      }
    }

    return (
      <div className={React.addons.classSet.apply(null, this.state.classNames)}>
        <header className="bar bar-nav">
          <a className="btn btn-link btn-nav pull-right" onTouchEnd={this.handleDone}>Done</a>
          <h1 className="title">Edit Profile</h1>
        </header>

        <div className="content">
          <div className="userListItem">
            {img}
            <div className="details show">
              <div className="nameAndSkillCount"><input className="name" type="text" value={this.state.name} onChange={this.onChange}/></div>
              <div className="statement"><textarea type="text" value={this.state.statement} onChange={this.onChange}/></div>
              <div className="location"><input type="text" value={this.state.location} onChange={this.onChange}/></div>
              <div className="skills">
                <h4><span className="icon ion-ios7-bolt"></span> Super Powers</h4>
                <ul>
                  {skills}
                </ul>
              </div>
            </div>
          </div>
        </div>

      </div>
    );
  }
});

module.exports = ProfileEditScreen;