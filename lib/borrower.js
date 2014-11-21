
var path = require('path'),
    fs = require('fs'),
    Chain = require('chaining'),
    bower = require('bower'),
    _ = require('lodash'),
    logger = require('./logger'),
    installer = require('./installer');

require('chaining/src/es6/q');

function getCwd() {
    var dir = process.cwd();

    if (path.basename(dir) === 'borrower' && path.basename(path.join(dir, '..')) === 'node_modules') {
        // installed as a dependency
        return path.join(dir, '..', '..');
    }

    return dir;
}

function getTargetPackage() {
    return require(getCwd() + '/package');
}

function getBowerConfig (cwd, pkg) {
    var bowerConfig = bower.config;
    var config = (pkg.config && pkg.config.bower) || {};

    bowerConfig.cwd = cwd;
    bowerConfig.directory = 'static_modules';

    _.merge(bowerConfig, config);
    return bowerConfig;
}

exports.install = function (packages, save) {
    logger.info('Installing static modules');

    var cwd = getCwd(),
        pkgConfig = getTargetPackage(),
        bowerConfig = getBowerConfig(cwd, pkgConfig);

    var depedencies = [];
    packages.forEach(function (name) {
        depedencies.push({
            source: name,
            target: '*',
        });
    });

    if (!packages.length && pkgConfig.staticDependencies) {
        var deps = pkgConfig.staticDependencies;
        Object.keys(deps).forEach(function (name) {
            depedencies.push({
                source: name,
                target: deps[name],
            });
        });
    }

    // if (!options.produciton && !options.global) {
    //     packages = packages.concat(pkgConfig.staticDevDepencencies);
    // }
    if (!depedencies) {
        logger.info('nothing to do');
        return;
    }

    var chain = new Chain();

    chain.next(installer.bowerInstaller(cwd, pkgConfig, bowerConfig, save))
    .next(installer.requirejsInstaller(cwd, bowerConfig))
    .process(depedencies).then(function () {
        logger.info('All static modules installed successfully !');
    }, function (err) {
        logger.error('Somethings somewhere where terribly wrong...');
        logger.error(err.stack);
    }, function (dep) {
        logger.info('installed', dep.name);
    });
};

exports.init = function () {

    var pkg = getTargetPackage();
    pkg.scripts = pkg.scripts || {};
    var postinstall = pkg.scripts.postinstall || '';

    if (!/borrower\ /.test(postinstall)) {
        console.log('Initialize static modules dependencies');
        if (postinstall) {
            postinstall += ' && ';
        }
        postinstall += 'borrower install';

        pkg.scripts.postinstall = postinstall;

        fs.writeFile(getCwd() + '/package.json', JSON.stringify(pkg, null, 2), function () {
            exports.install([]);
        });
    }
};