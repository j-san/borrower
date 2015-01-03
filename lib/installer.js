var fs = require('fs'),
    path = require('path'),
    Manager = require('bower/lib/core/Manager'),
    bowerRequirejs = require('bower-requirejs'),
    Chain = require('chaining'),
    logger = require('./logger');


function getBaseUrl(cwd, docRoot) {
    return '/' + path.relative(docRoot, cwd);
}

exports.requirejsInstaller = function (cwd, bowerConfig) {

    var requirejsInstaller = new Chain();
    var requirejsPath = path.join(cwd, bowerConfig.directory, 'require.js');

    requirejsInstaller.next(function (previous, done) {
        fs.readFile(__dirname + '/../node_modules/requirejs/require.js', done);
    }).next(function (content, done) {
        this.requirejsContent = content;
        bowerRequirejs({
            transitive: true,
            bowerOpts: bowerConfig,
            baseUrl: bowerConfig.baseUrl
        }, done);
    }).next(function (content, done) {
        if (bowerConfig.baseUrl) {
            content.baseUrl = getBaseUrl(cwd, bowerConfig.baseUrl);
        }

        this.requirejsContent = [
            'window.MAIN_SCRIPTS = [];var i,m,ts = document.getElementsByTagName("script");',
            'for(i=0;i<ts.length;i++){m=ts[i].getAttribute("data-main");if(m){window.MAIN_SCRIPTS.push(m);ts[i].removeAttribute("data-main");}}',
            this.requirejsContent,
            'requirejs.config(' + JSON.stringify(content) + ');require(window.MAIN_SCRIPTS);'
        ].join('\n');

        logger.debug('write', requirejsPath);
        fs.writeFile(requirejsPath, this.requirejsContent, done);
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
            if(!pkg.staticDependencies) {
                pkg.staticDependencies = {};
            }
            this.targets.forEach(function (target) {
                pkg.staticDependencies[target.source] = target.target;
            });
            logger.debug('save dependencies', cwd + '/package.json');
            fs.writeFile(cwd + '/package.json', JSON.stringify(pkg, null, 2), done);
        });
    }

    return bowerInstaller;
};

