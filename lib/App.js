const get = require('get-value');
const set = require('set-value');

const GetOpt = require('node-getopt');
const moment = require('moment');
const { produce } = require('immer');

class App {
    /**
     * Construct the application.
     *
     * @param customLogger
     */
    constructor(customLogger = null) {
        // eslint-disable-next-line global-require
        this.logger = customLogger || require('./logger');
    }

    /**
     * Run the application.
     *
     * @return {Promise<void>}
     */
    async run() {
        this.logger.debug(`Starting at ${moment().format()}.`);

        this.getOptions();

        this.logger.debug('%s %s', this.argv, this.options);

        this.execute();
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

        if (this.options.help) {
            getopt.getHelp();
        }
    }

    /**
     * Perform the action.
     */
    execute() {
        const originalArray = [1, 2, 3, 4];
        const modifiedArray = produce(originalArray, (draft) => {
            draft.push(5);
            return draft;
        });

        this.logger.info('Original Array %s : modified %s', originalArray, modifiedArray);

        const originalInt = 1;
        const modifiedInt = produce(originalInt, () => 2);

        this.logger.debug('Original Int %d : modified %d', originalInt, modifiedInt);

        const originalObj = { name: 'David' };
        const modifiedObj = produce(originalObj, (draft) => {
            draft.surname = 'Lloyd';
        });

        this.logger.debug('Original Obj %s : modified %s', originalObj, modifiedObj);

        const complex = {};
        set(complex, 'a.b.c.d.e.f.g.h.i.j', 200);

        const complexModified = produce(complex, (draft) => {
            set(draft, 'a.b.c.d.e.f.1', 300);
        });

        this.logger.debug('Complex - complexModified', { complex, complexModified });
    }
}

module.exports = App;
