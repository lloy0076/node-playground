const Boom = require('@hapi/boom');
const GetOpt = require('node-getopt');

const fs = require('fs');
const moment = require('moment');
const parse = require('csv-parse');

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

        const data = await this.parseFile();
        this.logger.debug('Lines %d:', data.length, { data });
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
            ['', 'delimeter[=ARG]', 'The delimiter'],
            ['f', 'file=ARG', 'The file name'],
            ['t', 'trim', 'Trim around the delimiter'],
            ['h', 'help', 'display this help'],
        ]);

        const { argv, options } = getopt.parseSystem();

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
        const { delimiter, file, trim } = this.options;

        const defaultDelimiter = process.env.DEFAULT_DELIMETER ? process.env.DEFAULT_DELIMETER : ',';
        this.delimiter = delimiter || defaultDelimiter;

        const defaultTrim = process.env.TRIM;
        this.trim = trim || !!defaultTrim;

        this.logger.debug('Trim %s', !!defaultTrim);

        try {
            if (!file) {
                throw Boom.preconditionFailed('The file name may not be empty.');
            }

            fs.accessSync(file, fs.constants.R_OK);

            const re = new RegExp('.csv$');
            if (!file.match(re)) {
                throw Boom.preconditionFailed(`File "${file}" must have an extension of ".csv".`);
            }
        } catch (error) {
            if (error.code && error.code === 'ENOENT') {
                throw Boom.notFound(`File "${file}" not found.`);
            }

            throw new Boom.Boom(error);
        }
    }

    /**
     * Parses the file.
     *
     * @return {Promise<unknown>}
     */
    parseFile() {
        return new Promise((resolve, reject) => {
            const inputStream = fs.createReadStream(this.options.file);
            const parser = parse({
                delimiter: this.delimiter,
                trim: this.trim,
                columns: true,
                comment: '#',
            });

            this.logger.debug(this.trim);

            const output = [];

            parser.on('readable', () => {
                let record = parser.read();
                while (record) {
                    output.push(record);
                    record = parser.read();
                }
            });

            parser.on('error', (error) => {
                const boom = new Boom.badData(error);
                this.logger.error(boom);
                reject(boom);
            });

            parser.on('end', () => {
                this.logger.info('Parsed %d lines, found %d records and %d comments.',
                    parser.info.lines,
                    parser.info.records,
                    parser.info.comment_lines);
                resolve(output);
            });

            inputStream.pipe(parser);
        });
    }
}

module.exports = App;
