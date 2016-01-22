
var bundle = require('..')

bundle(
  {
    'entry-file': ['homepage/script/index.ios.js', 'todayspecial/script/index.ios.js'],
    dev: true,
    transformer: require.resolve('react-native/packager/transformer'),
    verbose: false,
    platform: 'ios',
  },
  {
    projectRoots: [__dirname],
    blacklistRE: requireRN('packager', 'blacklist')('ios'),
  }
)

