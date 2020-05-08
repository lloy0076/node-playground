const { createStore } = require('redux');
const { produce } = require('immer');

class AppStore {
    /**
     * Construct the app store.
     */
    constructor(args = {}) {
        // eslint-disable-next-line global-require
        this.logger = args.logger || require('./logger');

        const initialState = {
            count: 0,
        };

        /**
         * Adjust the value.
         *
         * @param state
         * @param payload
         * @param invert
         * @return * {<Base extends Immutable<Parameters<*>[0]>>(base?: Base, ...rest: Tail<Parameters<*>>) =>
         *     Produced<Base, ReturnType<*>>}
         */
        function adjust(state, payload, invert = 1) {
            return produce(state, (draft = initialState) => {
                if (Array.isArray(payload) && payload.length > 0) {
                    payload.forEach((value) => {
                        const by = Number.parseFloat(value);
                        draft.count += by * invert;
                    });
                } else if (typeof payload !== 'undefined' && Object.keys(payload).includes('by')) {
                    const by = Number.parseFloat(payload.by);
                    draft.count += by * invert;
                } else {
                    draft.count += 1 * invert;
                }
            });
        }

        this.store = createStore((state = initialState, action = {}) => {
            const type = action.type.toUpperCase();
            this.logger.silly('Executing action type "%s".', type);

            switch (type) {
            case 'INCREMENT':
                return adjust(state, action.payload);
            case 'DECREMENT':
                return adjust(state, action.payload, -1);
            case 'RESET':
            case 'RESET_COUNT':
                return produce(state, (draft = initialState) => {
                    draft.count = 0;
                });
            default:
                this.logger.debug('No action type', action);
                return state;
            }
        });
    }

    /**
     * Gets the store.
     *
     * @return {Store<(<Base extends Immutable<function(*=): void>>(base?: Base, ...rest: Tail<Parameters<*>>) =>
     *     Produced<Base, ReturnType<*>>)|{count: number}, Action>}
     */
    getStore() {
        return this.store;
    }
}

const instance = new AppStore();
const Store = instance.getStore();

module.exports = Store;
