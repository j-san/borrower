#!/usr/bin/env node

var program = require('commander'),
    pkg = require('../package'),
    borrower = require('../lib/borrower.js');


program
    .version(pkg.version);

program.command('init')
    .description('register npm post install hook in the current package.json')
    .action(function () {
        borrower.init();
    });

program.command('install [pkgs...]')
    .option('-S --save', 'Save dependency in package.json')
    .action(function (pkgs, command) {
        borrower.install(pkgs, command.save);
    });

program.parse(process.argv);
