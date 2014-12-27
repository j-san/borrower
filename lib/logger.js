require('colors');

function log() {
    console.log.apply(null, arguments);
}

var levels = {
    debug: 'grey',
    info: 'blue',
    error: 'red'
};

Object.keys(levels).forEach(function (level) {
    var color = levels[level];
    exports[level] = function () {
        var args = Array.prototype.slice.call(arguments, 0);
        args.unshift(level[color]);
        log.apply(null, args);
    };
});


var logger = {
    log: function (level, id, message) {
        log(level, id, message);
    },
    info: function (id, message, data) {
        this.progress(id, message, data);
    },
    action: function (id, message, data) {
        this.progress(id, message, data);
    },
    progress: function (id, message) {
        var gitParts = message.match(/git:\/\/github.com\/.*\/(.*).git/);
        if(gitParts && gitParts.length > 1) {
            message = gitParts[1];
        }
        var targetParts = message.match(/(.*)#.*/);
        if(targetParts && targetParts.length > 1) {
            message = targetParts[1];
        }

        this.running[message] = this.running[message] || [];
        this.running[message].push(id);
        if (this.stream.isTTY) {
            this.render();
        } else {
            console.log(id, '>'.bold, message);
        }
    },
    render: function () {
        var str = "", nbLines = 0;
        for (var lib in this.running) {
            str += lib + ' - ' + this.running[lib].join(' > ') + '\n';
            nbLines++;
        }
        this.stream.cursorTo(0);
        this.stream.moveCursor(0, -this.progressNbLines || 0);
        this.stream.clearScreenDown();
        this.stream.write(str);
        this.progressNbLines = nbLines;
    },
    geminate: function () {
        return this;
    },
    intercept: function () {}
};

logger.stream = process.stdout;
logger.running = {};

exports.getBowerLogger = function () {
    return logger;
};
