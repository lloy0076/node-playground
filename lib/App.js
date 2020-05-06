const Boom = require('@hapi/boom');
const GetOpt = require('node-getopt');
const moment = require('moment');

class App {
    /**
     * Construct the application.
     *
     * @param args
     */
    constructor(args = {}) {
        // eslint-disable-next-line global-require
        this.logger = args.logger || require('./logger');
        this.store = args.store;
    }

    /**
     * Run the application.
     *
     * @return {Promise<void>}
     */
    async run() {
        this.logger.debug(`Starting at ${moment().format()}.`);

        this.getOptions();
        this.validateOptions();

        this.logger.debug('%s %s', this.argv, this.options);

        this.dispatch({ type: 'INCREMENT' });
        this.dispatch({ type: 'INCREMENT' });
        this.dispatch({ type: 'INCREMENT' });
        this.dispatch('increment');

        this.logger.debug('Store state:', { state: this.store.getState() });
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
        if (!this.store) {
            throw new Boom.Boom('No redux store configured.');
        }

        return this; // This is here only to stop eslint from complaining.
    }

    /**
     * Dispatch the arguments.
     *
     * @param args
     * @return {*}
     */
    dispatch(...args) {
        if (typeof args[0] === 'string') {
            this.logger.debug('args[0] is %s', args[0]);
            const type = args[0].toUpperCase();
            const payload = args.length > 1 ? args.slice(1) : [];
            return this.store.dispatch({ type, payload });
        }

        return this.store.dispatch(...args);
    }
}

module.exports = App;
