const React = require('react-native')

var { TabBarIOS, NavigatorIOS  } = React

require('awesome/lib/sayHi')

var Foo = React.createClass({
  render: function() {
    return (
      <TabBarIOS>
        <TabBarIOS.Item title="React Native" selected={true}>
          <NavigatorIOS initialRoute={{ title: 'React Native' }} />
        </TabBarIOS.Item>
      </TabBarIOS>
    );
  },
})

React.AppRegistry.registerComponent('foo', () => Foo)
