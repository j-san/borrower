require('colors');

function log() {
    console.log.apply(null, arguments);
}

var levels = {
    debug: 'grey',
    info: 'blue',
    error: 'red'
};
var currentLevelNo = 0;
var levelsNo = {
    debug: 0,
    info: 5,
    error: 10,
    silence: 15
};

Object.keys(levels).forEach(function (level) {
    var color = levels[level];
    var no = levelsNo[level];
    exports[level] = function () {
        if(no >= currentLevelNo) {
            var args = Array.prototype.slice.call(arguments, 0);
            args.unshift(level[color]);
            log.apply(null, args);
        }
    };
});

exports.setLevel = function(level) {
    currentLevelNo = levelsNo[level];
};


var logger = {
    log: function (level, id, message) {
        log(level, id, message);
    },
    info: function (id, message, data) {
        if(levelsNo.info >= currentLevelNo) {
            this.progress(id, message, data);
        }
    },
    action: function (id, message, data) {
        if(levelsNo.info >= currentLevelNo) {
            this.progress(id, message, data);
        }
    },
    progress: function (id, message) {
        message = this.parse(message);

        if (id === 'progress' || id === 'extract') {
            return;
        }
        this.running[message] = this.running[message] || [];
        this.running[message].push(id);
        if (this.stream.isTTY) {
            this.render();
        } else {
            console.log(id, '>'.bold, message);
        }
    },
    parse: function (message) {
        var tarParts = message.match(/https:\/\/github.com\/.*\/(.*)\/archive\/.*/);
        if(tarParts && tarParts.length > 1) {
            return tarParts[1];
        }
        var gitParts = message.match(/git:\/\/github.com\/.*\/(.*)\.git/);
        if(gitParts && gitParts.length > 1) {
            return gitParts[1];
        }
        var targetParts = message.match(/(.*)#.*/);
        if(targetParts && targetParts.length > 1) {
            return targetParts[1];
        }

        return message;
    },
    render: function () {
        var str = "", nbLines = 0;
        for (var lib in this.running) {
            str += lib + ' - ' + this.running[lib].join(' > '.bold) + '\n';
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
