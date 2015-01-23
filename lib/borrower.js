
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

function getBowerConfig (pkg) {
    var bowerConfig = bower.config;
    var config = (pkg.config && pkg.config.bower) || {};

    bowerConfig.name = pkg.name;
    bowerConfig.version = pkg.version;
    bowerConfig.cwd = getCwd();
    bowerConfig.directory = 'static_modules';
    bowerConfig.baseUrl = '';

    _.merge(bowerConfig, config);
    return bowerConfig;
}

exports.logger = logger;

exports.install = function (packages, save) {
    var pkgConfig = getTargetPackage(),
        bowerConfig = getBowerConfig(pkgConfig),
        cwd = bowerConfig.cwd;

    var depedencies = [];
    if (packages && packages.length) {
        // TODO: get package version
        packages.forEach(function (name) {
            depedencies.push({
                source: name,
                target: '*',
            });
        });
    } else if (pkgConfig.staticDependencies) {
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
    if (depedencies.length) {
        logger.info('Installing static modules');

        var chain = new Chain();

        chain.next(installer.bowerInstaller(cwd, pkgConfig, bowerConfig, save));
        chain.next(installer.requirejsInstaller(cwd, bowerConfig));

        return chain.process(depedencies).then(function () {
            logger.info('All static modules installed successfully !');
        }, function (err) {
            logger.error('Somethings somewhere where terribly wrong...');
            logger.error(err.stack);
        });
    }

};

exports.init = function () {

    var pkg = getTargetPackage();
    pkg.scripts = pkg.scripts || {};
    var postinstall = pkg.scripts.postinstall || '';
    return new Promise(function (resolve) {
        if (!/borrower\ /.test(postinstall)) {
            logger.info('Initialize static modules dependencies');
            if (postinstall) {
                postinstall += ' && ';
            }
            postinstall += 'borrower install';

            pkg.scripts.postinstall = postinstall;

            fs.writeFile(getCwd() + '/package.json', JSON.stringify(pkg, null, 2), function () {
                resolve();
            });
        } else {
            resolve();
        }
    }).then(function() {
        return exports.install();
    });
};

exports.build = function (input, output) {

    var pkgConfig = getTargetPackage(),
        bowerConfig = getBowerConfig(pkgConfig),
        cwd = bowerConfig.cwd;

    var builder = installer.requirejsOptimization(cwd, bowerConfig, input, output);

    return builder.process().then(function (content) {
            console.log(content);
    }, function (err) {
        logger.error(err.stack);
    });
};