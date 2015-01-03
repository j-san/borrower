
Borrower
========

[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/j-san/borrower?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Build Status](https://travis-ci.org/j-san/borrower.png?branch=master)](https://travis-ci.org/j-san/borrower)
[![Dependency Status](https://david-dm.org/j-san/borrower.png)](https://david-dm.org/j-san/borrower)

Forget complexity of Require.js config, don't worry about running Bower install.

**Note: this project is a work in progress.**

The goal is to keep all configurations in a single configuration file and a working enviromnemnt with a single install command.

Usage
-----

```shell
$ npm install borrower --save

$ node_modules/.bin/borrower install jquery --save
```

It will install Bower Components in `static_modules/` and save dependency in `package.json`.

html

```html
<script data-main="app.js" src="static_modules/require.js"></script>
```

Require.js is configured, you can just focus on your Javascript.

**That's all folks !**



Configuration
-------------

package.json
```
{
    ...
    staticDependencies: [...],
    ...
    config: {
        bower: {
            directory: 'static_modules',  // name of the folfder containing dependencies
            cwd: '',                      // where static modules must be installed
            baseUrl: ''                   // location of the ducoment root
                                          // an absolute path from this location will be used in requirejs config
                                          // if empty, a relative path will be used
        }
    }
}
```

Configurations from [.bowerrc](http://bower.io/docs/config/) are available in `package.json > config > bower`

express static example: `...`


How it works
------------

```shell
$ borrower init
```

It will register a npm `postinstall` hook in your `package.json` to run Bower and configure Require on every `npm install`.

Require.js is configured inside `static_modules/require.js` and updated at each install run.

