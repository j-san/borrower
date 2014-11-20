
var path = require('path'),
    Chain = require('chaining'),
    logger = require('./logger'),
    installer = require('./installer');

require('chaining/src/es6/q');

function cwd() {
    var dir = process.cwd();

    if (path.dirname(path.join(dir, '..')) == 'node_modules' && path.dirname(dir) == 'borrower') {
        // installed as a dependency
        return path.join(dir, '..', '..');
    }

    return dir;
}

function getTargetPackage() {
    return require(cwd() + '/package');
}

function getSelfPackage() {
    return require('../package');
}


exports.install = function (packages, save) {
    logger.info('Installing static modules');

    var pkgConfig = getTargetPackage();

    depedencies = [];
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

    chain = new Chain();

    chain.next(installer.bowerInstaller(cwd(), pkgConfig, save))
    .next(installer.requirejsInstaller(cwd(), pkgConfig))
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
    console.log('Initialize static modules dependencies');

    var pkg = getTargetPackage();

    if (getSelfPackage().name == getTargetPackage().name) {
        // Renning init on myself, abording
        return;
    }

    if (cwd() == process.cwd()) {
        // command line call, funny message
        logger.info("I've no question, sorry... Moving forward.");
    }

    pkg.scripts = pkg.scripts || {};

    postInstallScripts = [];

    if(pkg.scripts.postinstall) {
        postInstallScripts.push(pkg.scripts.postinstall);
    }
    if (
        pkg.scripts.postinstall &&
        !pkg.scripts.postinstall.test('borrower ')
    ) {
        pkg.scripts.postinstall = 'borrower install';
    }

    pkg.scripts.postinstall = postInstallScripts.join(' && ');

    fs.writeFile(cwd() + '/package.json', JSON.stringify(pkg, null, 2), function () {
        exports.install();
    });

};