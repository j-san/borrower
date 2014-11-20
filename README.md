
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
you may configure available config in .bowerrc package.json > config > bower

[.bowerrc](http://bower.io/docs/config/) Don't worry about config, just use defaults are goods.

express static: `...`


How it works
------------

```shell
borrower init
# It will register a npm `postinstall` hook in your `package.json` to run Bower.


#
# And save dependency in `staticDependencies` in your package.js

echo -e "\nstatic_modules/" >> .gitingore
```


