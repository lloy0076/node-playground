const GetOpt = require('node-getopt');
const moment = require('moment');

class App {
    constructor(customLogger) {
        // eslint-disable-next-line global-require
        this.logger = customLogger || require('./logger');
    }

    async run() {
        this.logger.debug(`Starting at ${moment().format()}.`);

        this.getOptions();
        this.validateOptions();

        this.logger.debug('%s %s', this.argv, this.options);
    }

    /**
     * Gets the options:
     *
     * - file The file (must end in .csv)
     * - help The help
     * .
     */
    getOptions() {
        const getopt = new GetOpt([
            ['h', 'help', 'display this help'],
        ]);

        const { argv, options } = getopt.bindHelp().parseSystem();

        this.argv = argv;
        this.options = options;
    }

    /**
     * Validates the options.
     *
     * - the file option must not be empty, must end in .csv and must be readable.
     * .
     */
    validateOptions() {
        return this;
    }
}

module.exports = App;
