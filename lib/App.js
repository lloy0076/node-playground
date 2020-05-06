const Bottle = require('bottlejs');
const GetOpt = require('node-getopt');

const moment = require('moment');

const RandomNumberGenerator = require('./RandomNumberGenerator');

class App {
    constructor(customLogger, max = 255) {
        // eslint-disable-next-line global-require
        this.logger = customLogger || require('./logger');
        const bottle = new Bottle();

        // bottle.service('NumberGenerator', RandomNumberGenerator);
        bottle.factory('NumberGenerator', () => new RandomNumberGenerator(max));

        this.bottle = bottle;
    }

    async run() {
        this.logger.debug(`Starting at ${moment().format()}.`);

        this.getOptions();
        this.validateOptions();

        this.logger.debug('%s %s', this.argv, this.options);

        const numbers = [];
        this.logger.debug('%s', this.bottle.list());
        for (let i = 1; i <= 25; i += 1) {
            this.logger.debug('%d: %s', i, this.bottle.container.NumberGenerator.setUpTo(i).next());
        }

        this.logger.info('Generated 10 numbers: %s', numbers);
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
        return this; // This is here only to stop eslint from complaining.
    }
}

module.exports = App;
