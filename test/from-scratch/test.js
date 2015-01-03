var exec = require('mz/child_process').exec,
    fs = require('mz/fs'),
    t = require('thunkify'),
    rimraf = require('rimraf'),
    borrower = require('../../lib/borrower');

var rm = t(rimraf);
require('chai').should();

describe('from scratch project', function () {
    before(function *() {
        process.cwd = function () {
            return __dirname + '/fixtures/';
        };
        borrower.logger.setLevel('silence');
    });

    it('should init post install', function* () {
        yield borrower.init();

        var pkg = yield fs.readFile(__dirname + '/fixtures/package.json');
        pkg = JSON.parse(pkg);
        pkg.should.have.a.property('scripts');
        pkg.scripts.should.have.a.property('postinstall');
        pkg.scripts.postinstall.should.equal('borrower install');
    });

    it('should not set post install if already initialized', function* () {
        var pkg = require('./fixtures/package');
        pkg.scripts.postinstall = 'borrower install';
        yield fs.writeFile(__dirname + '/fixtures/package.json', JSON.stringify(pkg));

        yield borrower.init();

        pkg = yield fs.readFile(__dirname + '/fixtures/package.json');
        pkg = JSON.parse(pkg);
        pkg.scripts.postinstall.should.equal('borrower install');
    });

    it('should add install at end of former postinstall', function* () {
        var pkg = require('./fixtures/package');
        pkg.scripts.postinstall = 'do stuff';
        yield fs.writeFile(__dirname + '/fixtures/package.json', JSON.stringify(pkg));

        yield borrower.init();

        pkg = yield fs.readFile(__dirname + '/fixtures/package.json');
        pkg = JSON.parse(pkg);
        pkg.scripts.postinstall.should.equal('do stuff && borrower install');
    });

    afterEach(function *() {
        var content = yield fs.readFile(__dirname + '/initial-package.json');
        yield fs.writeFile(__dirname + '/fixtures/package.json', content);
        yield rm(__dirname + '/fixtures/static_modules');
        yield rm(__dirname + '/fixtures/node_modules');
    });
});