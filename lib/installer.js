var fs = require('fs'),
    path = require('path'),
    Manager = require('bower/lib/core/Manager'),
    bower = require('bower'),
    requirejs = require('requirejs'),
    bowerRequirejs = require('bower-requirejs'),
    Chain = require('chaining'),
    logger = require('./logger');


function getBaseUrl(cwd, docRoot) {
    if (docRoot) {
        return '/' + path.relative(docRoot, cwd);
    } else {
        return '';
    }
}

exports.requirejsConfigLoader = function (cwd, bowerConfig) {

    var loader = new Chain();

    loader.next(function (previous, done) {
        fs.readFile(__dirname + '/../node_modules/requirejs/require.js', done);
    }).next(function (content, done) {
        this.requirejsContent = content;

        return bower.commands.list({}, bowerConfig).on('end', done);
    }).next(function (installed, done) {
        this.installed = installed;

        bowerRequirejs({
            transitive: true,
            bowerOpts: bowerConfig,
            baseUrl: bowerConfig.baseUrl
        }, done);
    }).next(function (content) {
        content.baseUrl = getBaseUrl(cwd, bowerConfig.baseUrl);
        content.shim = {};
        function resolveDeps (module) {
            var dependencies = [];
            Object.keys(module.dependencies).forEach(function (name) {
                dependencies.push(name);
                content.shim[name] = {
                    deps: resolveDeps(module.dependencies[name])
                };
            });
            return dependencies;
        }
        resolveDeps(this.installed);

        this.requirejsConfig = content;
    });

    return loader;
};

exports.requirejsInstaller = function (cwd, bowerConfig) {

    var installer = exports.requirejsConfigLoader(cwd, bowerConfig);

    installer.next(function(prev, done) {
        this.requirejsContent = [
            'window.MAIN_SCRIPTS = [];var i,m,ts = document.getElementsByTagName("script");',
            'for(i=0;i<ts.length;i++){m=ts[i].getAttribute("data-main");if(m){window.MAIN_SCRIPTS.push(m);ts[i].removeAttribute("data-main");}}',
            this.requirejsContent,
            'requirejs.config(' + JSON.stringify(this.requirejsConfig) + ');require(window.MAIN_SCRIPTS);'
        ].join('\n');

        var requirejsPath = path.join(cwd, bowerConfig.directory, 'require.js');
        logger.debug('write', requirejsPath);
        fs.writeFile(requirejsPath, this.requirejsContent, done);
    });

    return installer;
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

exports.requirejsOptimization = function (cwd, bowerConfig, input, output) {
    var builder = exports.requirejsConfigLoader(cwd, bowerConfig);

    builder.next(function (prev, done) {
        this.requirejsConfig.name = input;
        this.requirejsConfig.out = output;
        this.requirejsConfig.baseUrl = getBaseUrl(cwd, bowerConfig.baseUrl);

        requirejs.optimize(this.requirejsConfig, done, done);
    });

    return builder;
};

