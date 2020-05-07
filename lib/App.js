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
        this.logger.info('Dispatching actions.');
        this.logger.debug(`Starting at ${moment().format()}.`);

        this.getOptions();
        this.validateOptions();

        this.logger.debug('%s %s', this.argv, this.options);

        // Use the various type of dispatches
        this.dispatch('increment', 1);
        this.dispatch('increment', 1, 1);
        this.dispatchObj('increment', { by: 2 });

        this.dispatch('decrement');
        this.dispatchObj({ type: 'DECREMENT', payload: [2] });
        this.dispatchObj('decrement', { by: 2 });

        this.logger.debug('Store state:', { state: this.store.getState() });

        const state = this.store.getState();

        if (state.count !== 0) {
            throw new Boom.Boom(`Expected state.count to be equal to numeric 0 but got "${state.count}" `
                + `(type ${typeof state.count}).`);
        } else {
            this.logger.info('Count was 0 as expected.');
        }
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
     * Dispatch with a payload array.
     *
     * @param args
     * @return {*}
     */
    dispatch(...args) {
        if (typeof args[0] === 'string') {
            const type = args[0].toUpperCase();
            const payload = args.length > 1 ? args.slice(1) : [];
            return this.store.dispatch({ type, payload });
        }

        return this.store.dispatch(...args);
    }

    /**
     *  Dispatch with a payload object.
     * @param type
     * @param payload
     * @return {*}
     */
    dispatchObj(type, payload) {
        if (typeof type === 'string') {
            const dispatchType = type.toUpperCase();
            return this.store.dispatch({ type: dispatchType, payload });
        }

        return this.store.dispatch(type);
    }
}

module.exports = App;
