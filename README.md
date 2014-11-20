
Borrower
========

Forget complexity of Require.js config, don't worry about running Bower install.


Usage
-----

Run

```shell
npm install borrower --save

node_modules/.bin/borrower install jquery --save
```

It will install Bower Components in `static_modules/` and save dependency in `package.json`.


Then in your html:

```html
<script data-main="app.js" src="static_modules/require.js"></script>
```

Require.js is already configured inside `static_modules/require.js`, you can just focus on your Javascript.


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

express static: `...`


How it works
------------

```shell
borrower init
# It will register a npm `postinstall` hook in your `package.json` to run Bower on every install.
```


