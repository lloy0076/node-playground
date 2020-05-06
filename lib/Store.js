const { createStore } = require('redux');
const { produce } = require('immer');

const initialState = {
    count: 0,
};

const Store = createStore((state = initialState, action = {}) => {
    switch (action.type) {
    case 'INCREMENT':
        return produce(state, (draft = initialState) => {
            draft.count += 1;
        });
    case 'DECREMENT':
        return produce(state, (draft = initialState) => {
            draft.count -= 1;
        });
    default:
        console.log('No action type', action);
        return state;
    }
});

module.exports = Store;
