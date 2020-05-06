const App = require('./lib/App');
const logger = require('./lib/logger');
const store = require('./lib/Store');

const main = new App({
    logger,
    store,
});

main.run().catch((error) => {
    logger.error(error.message, { error });
});
