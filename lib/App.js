const GetOpt = require('node-getopt');
const moment = require('moment');
const { produce } = require('immer');

class App {
    constructor(customLogger) {
        // eslint-disable-next-line global-require
        this.logger = customLogger || require('./logger');
    }

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
    }
}

module.exports = App;
