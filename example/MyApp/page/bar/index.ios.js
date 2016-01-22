const React = require('react-native')

var { ScrollView, TouchableHighlight, Text } = React

require('awesome/lib/sayHi')

var Bar = React.createClass({
  render: function() {
    return (
      <ScrollView>
        <TouchableHighlight onPress={() => console.log('pressed')}>
          <Text>Proper Touch Handling</Text>
        </TouchableHighlight>
      </ScrollView>
    );
  },
})

React.AppRegistry.registerComponent('bar', () => Bar)
