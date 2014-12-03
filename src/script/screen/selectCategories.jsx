/** @jsx React.DOM */

var React = require('react/addons');

// Data
var categories = require('../data/categories.js');

var SelectCategoriesScreen = React.createClass({
  getInitialState: function() {
    return {
      skills: this.props.skills
    };
  },
  handleDone: function (e) {
    if (this.state.skills !== this.props.skills) {
      this.props.propogateChanges(this.state.skills);
    }

    this.props.handleBack(e);
  },
  toggleSkill: function (e) {
    var id = e.target.attributes['data-id'].value;
    var i;
    var editedSkills;

    if (id === parseInt(id).toString()) {
      id = parseInt(id);
    }

    if ((i = this.state.skills.indexOf(id)) === -1) {
      // add
      editedSkills = this.state.skills.concat();
      editedSkills.push(id);
    } else {
      editedSkills = this.state.skills.concat();
      editedSkills.splice(i, 1);
    }
    this.setState({skills: editedSkills});
  },
  render: function(){
    console.log('SelectCategoriesScreen.render', this);

    var that = this;

    var categoryLIs = categories.map(function (category, i) {
      return (
        <li key={i}><span data-id={category.id} onTouchEnd={that.toggleSkill} className={that.state.skills.indexOf(category.id) !== -1 ? 'selected' : ''}>{category.name}</span>{' '}</li>
      );
    });

    return (
      <div>
        <header className="bar bar-nav">
          <a className="btn btn-link btn-nav pull-right" onTouchEnd={this.handleDone}>Done</a>
          <h1 className="title">Select Categories</h1>
        </header>

        <div className="content">
          <ul className="categories">
            {categoryLIs}
          </ul>
        </div>

      </div>
    );
  }
});

module.exports = SelectCategoriesScreen;