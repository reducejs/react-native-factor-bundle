# react-native-factor-bundle
Factor react-native packager bundles into common shared bundles

## Example

### Sources
Check the [directories](example/MyApp).

Here is an overview:
```
⌘ tree -I 'node_modules' .
.
├── build.js
├── lib
│   └── sayHi.js
├── package.json
└── page
    ├── bar
    │   └── index.ios.js
    └── foo
        └── index.ios.js

```

You should ignore the `build.js` right now.

Suppose we have two bundles to build: foo.ios.jsbundle, bar.ios.jsbundle.

### Build with the original RN packager
We can use the packager shipped with RN, and do:
```bash
node node_modules/react-native/local-cli/cli.js bundle --entry-file page/foo/index.ios.js --bundle-output rn-packager-build/foo.ios.jsbundle
node node_modules/react-native/local-cli/cli.js bundle --entry-file page/bar/index.ios.js --bundle-output rn-packager-build/bar.ios.jsbundle

```

Two bundles will be created under `rn-packager-build`.
```
⌘ tree -I 'node_modules' .
.
├── build.js
├── lib
│   └── sayHi.js
├── package.json
├── page
│   ├── bar
│   │   └── index.ios.js
│   └── foo
│       └── index.ios.js
└── rn-packager-build
    ├── bar.ios.jsbundle
    └── foo.ios.jsbundle

```

However, there are so many codes shared by the two bundles that
we decide to create another common bundle for sharing among them.

**NOTE**: To run the example successfully, you should copy the `react-native` directory to `MyApp/node_modules` rather than making a symlink to it.

**NOTE**: In `react-native` 0.18.1, probably you also have to run the following command. See [#5191](https://github.com/facebook/react-native/issues/5191)
```bash
rm node_modules/react-native/node_modules/react-transform-hmr/node_modules/react-proxy/node_modules/react-deep-force-update/.babelrc

```

### Build common shared bundles
So we instead run:
```bash
node build.js

```

**build.js**

```js
var bundle = require('../../')

Promise.resolve()
.then(function () {
  var del = require('del')
  return del('build')
})
.then(function () {
  var fs = require('fs')
  fs.mkdirSync('build')
})
.then(function () {
  var path = require('path')
  return bundle(
    {
      dev: true,
      transformer: require.resolve('react-native/packager/transformer'),
      verbose: false,
      platform: 'ios',
    },
    {
      projectRoots: [__dirname],
      blacklistRE: require('react-native/packager/blacklist')('ios'),
    },
    {
      entries: ['page/foo/index.ios.js', 'page/bar/index.ios.js'],
      output: function (entry) {
        var name = 'common'
        if (entry) {
          name = path.basename(path.dirname(entry))
        }
        return path.join('build', name + '.ios.jsbundle')
      },
    }
  )
})
.catch(function (err) {
  console.log(err.stack)
})


```

Now we get three bundles in `build`.
```
⌘ tree -I 'node_modules' .
.
├── build
│   ├── bar.ios.jsbundle
│   ├── common.ios.jsbundle
│   └── foo.ios.jsbundle
├── build.js
├── lib
│   └── sayHi.js
├── package.json
├── page
│   ├── bar
│   │   └── index.ios.js
│   └── foo
│       └── index.ios.js
└── rn-packager-build
    ├── bar.ios.jsbundle
    └── foo.ios.jsbundle

```

All codes from RN and `lib` are packed into `common.ios.jsbundle`,
while others are left into page-specific bundles.

We can check the diff:
```
⌘ diff build/common.ios.jsbundle rn-packager-build/foo.ios.jsbundle
1245a1246,1265
> __d('awesome/page/foo/index.ios.js',function(global, require, module, exports) {  var React=require('react-native/Libraries/react-native/react-native.js');var
>
> TabBarIOS=React.TabBarIOS;var NavigatorIOS=React.NavigatorIOS;
>
> require('awesome/lib/sayHi.js');
>
> var Foo=React.createClass({displayName:'Foo',
> render:function(){
> return (
> React.createElement(TabBarIOS,null,
> React.createElement(TabBarIOS.Item,{title:'React Native',selected:true},
> React.createElement(NavigatorIOS,{initialRoute:{title:'React Native'}}))));}});
>
>
>
>
>
>
> React.AppRegistry.registerComponent('foo',function(){return Foo;});
> });
58665c58685,58686
< __SSTOKENSTRING = "@generated SignedSource<<922f0da78fe19b36d9729f2c85b14e92>>";
---
> ;require("awesome/page/foo/index.ios.js");
> __SSTOKENSTRING = "@generated SignedSource<<0c2eb72ce14334d6a657b129439401e3>>";


```

**build/foo.ios.jsbundle**:
```js
__d('awesome/page/foo/index.ios.js',function(global, require, module, exports) {  var React=require('react-native/Libraries/react-native/react-native.js');var 

TabBarIOS=React.TabBarIOS;var NavigatorIOS=React.NavigatorIOS;

require('awesome/lib/sayHi.js');

var Foo=React.createClass({displayName:'Foo',
render:function(){
return (
React.createElement(TabBarIOS,null,
React.createElement(TabBarIOS.Item,{title:'React Native',selected:true},
React.createElement(NavigatorIOS,{initialRoute:{title:'React Native'}}))));}});






React.AppRegistry.registerComponent('foo',function(){return Foo;});
});
;require("awesome/page/foo/index.ios.js");
__SSTOKENSTRING = "@generated SignedSource<<8958bda140758263bb5ab4dde164c41e>>";

```

## TODO

* Tests.
* Handle assets.
* Command line tool.

