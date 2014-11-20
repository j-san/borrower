var fs = require('fs'),
    Manager = require('bower/lib/core/Manager'),
    bowerRequirejs = require('bower-requirejs'),
    Chain = require('chaining'),
    logger = require('./logger');


exports.requirejsInstaller = function (cwd, bowerConfig) {

    var requirejsInstaller = new Chain();
    var requirejsPath = cwd + '/static_modules/require.js';

    requirejsInstaller.next(function (previous, done) {
        fs.readFile(__dirname + '/../node_modules/requirejs/require.js', done);
    }).next(function (content, done) {
        this.requirejsContent = content;
        bowerRequirejs({
            bowerOpts: bowerConfig
        }, done);
    }).next(function (content, done) {
        this.requirejsConfig = 'requirejs(' + JSON.stringify(content) + ');';
        logger.debug('write', requirejsPath);
        fs.writeFile(requirejsPath, this.requirejsContent + this.requirejsConfig, done);
    });

    return requirejsInstaller;
};

exports.bowerInstaller = function (cwd, pkg, bowerConfig, save) {

    var manager = new Manager(bowerConfig, logger.getBowerLogger());
    var bowerInstaller = new Chain();

    bowerInstaller.next(function (targets) {
        this.targets = targets;
        return manager.configure({
            targets: targets,
        }).resolve();
    }).next(function () {
        return manager.preinstall();
    }).next(function () {
        return manager.install();
    }).next(function () {
        return manager.postinstall();
    });
    if (save) {
        bowerInstaller.next(function (prev, done) {
            this.targets.forEach(function (target) {
                pkg.staticDependencies[target.source] = target.target;
            });
            logger.debug('save dependencies', cwd + '/package.json');
            fs.writeFile(cwd + '/package.json', JSON.stringify(pkg, null, 2), done);
        });
    }

    return bowerInstaller;
};

