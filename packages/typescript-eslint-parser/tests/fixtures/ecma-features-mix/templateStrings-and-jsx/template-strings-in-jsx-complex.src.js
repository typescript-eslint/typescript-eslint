var React = require('react/addons');

var MyComponent = React.createClass({
  render: function() {
    return (
      <div>
        <div myProp={`${this.props.something}`}/>
        <div differentProp={`${this.props.anotherThing}`}/>
      </div>
    );
  }
});

module.exports = MyComponent;
