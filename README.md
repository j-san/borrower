
Borrower
========

[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/j-san/borrower?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Forget complexity of Require.js config, don't worry about running Bower install.

**This project is a work in progress.**

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
            ...
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

