'use strict';

require('react-native/packager/babelRegisterOnly')([
  /private-cli\/src/,
  /local-cli/,
])

var debug = require('react-native/local-cli/util/log').out('bundle')
//var debug = require('util').debuglog('bundle')
var path = require('path')
var ReactPackager = require('react-native/packager/react-packager')
var Bundle = require('react-native/packager/react-packager/src/Bundler/Bundle')
var saveAssets = require('react-native/local-cli/bundle/saveAssets')
var outputBundle = require('react-native/local-cli/bundle/output/bundle')

module.exports = function (args, config, bundleOptions) {
  var cwd = args.cwd || process.cwd()

  process.env.NODE_ENV = args.dev ? 'development' : 'production'

  var getClient = ReactPackager.createClientFor({
    projectRoots: config.projectRoots,
    blacklistRE: config.blacklistRE,
    transformModulePath: args.transformer,
    verbose: args.verbose,
    //projectRoots: config.getProjectRoots(),
    //assetRoots: config.getAssetRoots(),
    //blacklistRE: config.getBlacklistRE(),
    //getTransformOptionsModulePath: config.getTransformOptionsModulePath,
  }).then(function (c) {
    debug('Created ReactPackager')
    return c
  })

  return Promise.resolve().then(function () {
    return [].concat(bundleOptions.entries)
  })
  .then(function (entries) {
    debug('Found Entries:', entries.join(', '))
    return getClient.then(function (client) {
      return Promise.all(
        entries.map(function (file) {
          file = path.resolve(cwd, file)
          return outputBundle.build(client, {
            entryFile: file,
            sourceMapUrl: args['sourcemap-output'],
            dev: args.dev,
            minify: !args.dev,
            platform: args.platform,
          }).then(function (bundle) {
            bundle._entry = file
            return bundle
          })
        })
      )
    })
  })
  .then(function (bundles) {
    debug('Original Bundles:', bundles.length)
    if (bundles.length <= 1) {
      return bundles
    }
    var commonModules = {}
    var counts = {}
    var len = bundles.length
    bundles.forEach(function (bundle) {
      bundle.getModules().forEach(function (m) {
        var id = m.name + ' ' + m.sourcePath
        counts[id] = counts[id] || 0
        if (++counts[id] === len) {
          commonModules[id] = true
        }
      })
    })

    var added = {}
    var commonBundle = new Bundle()
    bundles.forEach(function (bundle) {
      var modules = []
      bundle.getModules().forEach(function (m) {
        var id = m.name + ' ' + m.sourcePath
        if (added[id]) return
        if (commonModules[id]) {
          added[id] = true
          commonBundle._modules.push(m)
        } else {
          modules.push(m)
        }
      })
      bundle._modules = modules
    })
    commonBundle.finalize()

    return [commonBundle].concat(bundles)
  })
  .then(function (bundles) {
    debug('Final Bundles', bundles.length)
    bundles.forEach(function (bundle) {
      var bopts = Object.create(args)
      bopts['bundle-output'] = bundleOptions.output(bundle._entry)
      outputBundle.save(bundle, bopts, debug)
    })
    return bundles
  })
  .then(function (bundles) {
    debug('Assets')
    return Promise.all(
      bundles.map(function (bundle) {
        return saveAssets(bundle.getAssets(), args.platform, args['assets-dest'])
      })
    )
  })
  .then(function () {
    debug('Closing client')
    getClient.then(function (client) {
      client.close()
    })
  })
}

