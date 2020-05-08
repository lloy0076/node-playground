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

        this.validateIncrement();
        this.resetCount();

        this.validateDecrement();
        this.resetCount();

        this.validateIncrementOrDecrement();

        this.validateReset();
    }

    /**
     * Validates tha reset sets to zero.
     */
    validateReset() {
        this.logger.info('Validating that reset sets count to 0.');
        this.dispatch('increment');
        this.resetCount();
        this.validateCount(0);
    }

    /**
     * Validates increment or decrement.
     */
    validateIncrementOrDecrement() {
        if (this.options.increment || this.options.decrement) {
            this.logger.info('Validating passed in increment/decrement.');

            let expectedCount;
            if (Object.keys(this.options).includes('expect')) {
                expectedCount = Number.parseFloat(this.options.expect);
            } else {
                // eslint-disable-next-line new-cap
                throw new Boom.preconditionFailed('--expect must be passed when validating increment or decrement.');
            }

            const increments = Object.keys(this.options).includes('increment') ? this.options.increment : [0];
            this.dispatch('increment', ...increments);

            const decrements = Object.keys(this.options).includes('decrement') ? this.options.decrement : [0];
            this.dispatch('decrement', ...decrements);

            this.validateCount(expectedCount);
        }
    }

    /**
     * Validates decrement.
     */
    validateDecrement() {
        this.logger.info('Validating decrement...');

        this.dispatch('decrement'); // 1
        this.dispatch('decrement', 1, 2); // 44
        this.dispatch({ type: 'decrement', payload: 1 }); // 5
        this.dispatch({ type: 'decrement', payload: [1] }); // 6
        this.dispatch({ type: 'decrement', payload: [1, 1] }); // 8
        this.dispatch({ type: 'decrement', by: 1 }); // 9

        const expectedCount = -9;
        this.validateCount(expectedCount);
    }

    /**
     * Validates increment.
     */
    validateIncrement() {
        this.logger.info('Validating increment...');

        this.dispatch('increment'); // 1
        this.dispatch('increment', 1, 2); // 44
        this.dispatch({ type: 'increment', payload: 1 }); // 5
        this.dispatch({ type: 'increment', payload: [1] }); // 6
        this.dispatch({ type: 'increment', payload: [1, 1] }); // 8
        this.dispatch({ type: 'increment', by: 1 }); // 9

        const expectedCount = 9;
        this.validateCount(expectedCount);
    }

    /**
     * Validate the count.
     *
     * @param expectedValue
     * @param actualCount
     */
    validateCount(expectedValue, actualCount = this.getCount()) {
        if (actualCount !== expectedValue) {
            throw new Boom.Boom(`Expected state.count to be equal to numeric ${expectedValue} but got "${actualCount}" `
                + `(type ${typeof actualCount}).`);
        } else {
            this.logger.info(`Count was ${expectedValue} as expected.`);
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
            ['i', 'increment=values+', 'increment values'],
            ['d', 'decrement=values+', 'decrement values'],
            ['e', 'expect=0', 'expected value'],
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

    /**
     * Get the count.
     *
     * @return {*}
     */
    getCount() {
        return this.store.getState().count;
    }

    /**
     * Resets the count.
     */
    resetCount() {
        this.dispatch('reset_count');
    }
}

module.exports = App;
