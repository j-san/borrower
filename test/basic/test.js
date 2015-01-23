var fs = require('mz/fs'),
    t = require('thunkify'),
    rimraf = require('rimraf'),
    borrower = require('../../lib/borrower');

var rm = t(rimraf);
require('chai').should();

describe('basic project', function () {
    before(function *() {
        process.cwd = function () {
            return __dirname + '/fixtures/';
        };
        borrower.logger.setLevel('silence');
    });

    it('should install requirments', function* () {
        this.timeout(5000);
        yield borrower.install();
        (yield fs.exists(__dirname + '/fixtures/static_modules/require.js')).should.equal(true);

        var content = yield fs.readFile(__dirname + '/fixtures/static_modules/require.js');
        content = content.toString();
        content.should.include('"highlightjs":"static_modules/highlightjs/highlight');
        content.should.include('"baseUrl":""');
    });

    afterEach(function *() {
        yield rm(__dirname + '/fixtures/static_modules');
        yield rm(__dirname + '/fixtures/node_modules');
    });
});