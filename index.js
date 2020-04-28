const App = require('./lib/App');
const logger = require('./lib/logger');

const main = new App(logger);

main.run().catch((error) => {
    logger.error(error.message, { error });
});
