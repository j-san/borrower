define(['highlightjs', 'text!package.json'], function (hljs, pkg) {
    hljs.initHighlighting();
    console.log(pkg);
});