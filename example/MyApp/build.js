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

