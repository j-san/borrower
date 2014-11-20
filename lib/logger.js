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
    log: function (level, id, message, data) {
        log(level, id, message);
    },
    info: function (id, message, data) {
        // exports.info(id, message);
        this.progress(id, message, data);
    },
    action: function (id, message, data) {
        // exports.action(id, message);
        this.progress(id, message, data);
    },
    progress: function (id, message, data) {
        this.running[message] = this.running[message] || [];
        this.running[message].push(id);
        if (this.stream.isTTY) {
            this.render();
        } else {
            console.log(id, '>' ,message);
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
