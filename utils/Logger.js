const moment = require('moment');
const chalk = require('chalk');
const Raven = require('raven');

class Logger {
    /**
     * Logger
     * @param {Boolean} level
     * @param {Boolean} time
     * @param {String} dsn
     */
    constructor(level, time, dsn) {
        this.level = level;
        this.time = time;
        Raven.config(dsn).install();
    }

    /**
     * Log info
     * @param {String} lbl
     * @param {String} msg
     */
    info(lbl, msg) {
        let level = '';
        let time = '';
        if (this.level) level = '[INFO] ';
        if (this.time) time = `[${chalk.grey.bold(moment().format('HH:mm:ss'))}]`;
        const message = chalk.green.bold(` ${level}(${lbl}) ${msg}`);
        console.log(time + message);
    }

    /**
     * Log warn
     * @param {String} lbl
     * @param {String} msg
     */
    warn(lbl, msg) {
        let level = '';
        let time = '';
        if (this.level) level = '[WARN] ';
        if (this.time) time = `[${chalk.grey.bold(moment().format('HH:mm:ss'))}]`;
        const message = chalk.yellow.bold(` ${level}(${lbl}) ${msg}`);
        console.log(time + message);
    }

    /**
     * Log error
     * @param {String} lbl
     * @param {String} msg
     */
    error(lbl, msg) {
        Raven.captureException(msg, {level: 'error'});

        let level = '';
        let time = '';
        if (this.level) level = '[ERROR] ';
        if (this.time) time = `[${chalk.grey.bold(moment().format('HH:mm:ss'))}]`;
        const message = chalk.red.bold(` ${level}(${lbl}) ${msg}`);
        console.log(time + message);
    }

    /**
     * Log init
     * @param {String} lbl
     * @param {String} msg
     */
    init(lbl, msg) {
        let level = '';
        let time = '';
        if (this.level) level = '[INIT] ';
        if (this.time) time = `[${chalk.grey.bold(moment().format('HH:mm:ss'))}]`;
        const message = chalk.cyan.bold(` ${level}(${lbl}) ${msg}`);
        console.log(time + message);
    }
}

module.exports = Logger;
