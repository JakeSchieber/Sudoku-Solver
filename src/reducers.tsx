import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';
import { RootState } from './configureStore';

// Create a slice of state under a named top level property, initilize state, and detail reducers to interact with it
// This wraps createAction and createReducer internally so that we do not need to do this ourselves.
// This uses Immer immer inside which uses a Proxy that lets you mutate the wrapped data but with a safely immutably updated value.
// This means our reducers can make direct changes to state instead of copying because Immer handles immutability for us
// You can only do this in Redux Toolkit's createSlice and createReducer, anywhere else adn it will mutate the state and cause bugs!
export const counterSlice = createSlice({
    name: 'counter',
    initialState: {
        value: 0,
        secret: {
            value: 0
        }
    },
    reducers: {
        increment: state => {
            state.value += 1
        },
        increaseByAmount: (state, action: PayloadAction<number>) => {
            state.value += action.payload
        }
    }
});

// export the actions for counter (ex: counterSlice.increment), these map to the reducers defined above
export const { increment, increaseByAmount } = counterSlice.actions;

export const counterReducer = counterSlice.reducer;

export const userSlice = createSlice({
    name: 'user',
    initialState: {
        name: "Jake"
    },
    reducers: {
        set: (state, action: PayloadAction<string>) => {
            state.name = action.payload
        }
    }
});

export const { set } = userSlice.actions;
export const userReducer = userSlice.reducer;

/*
// TODO: When using configureStore you can just send this directly as different properties and it will automatically call combineReducers
// Redux store ultimately takes 1 root reducer, this combines all reducers from the inidividual slicers into 1
// The naming here details the reducer, state and action hierarchy.  Ex: [name].[underlying action/state] 
const RootReducer = combineReducers({
    counter: counterSlice.reducer,
    user: userSlice.reducer,
});
export default RootReducer;

// In order to create selectors we need to pull the type of state out of the reducer
export type RootState = ReturnType<typeof RootReducer>;
*/

// Create selectors on state and export
export const selectCount = (state: RootState) => state.counter.value;
// Selectors can derive the return value (ex: appending a string below)
export const selectName = (state: RootState) => state.user.name + " Schieber";

// We can use createSelector in order to create a selector, it can derive based on other selectors
// The primary benefit of this approach is performance. This wrapper creates a selector that is memoized so that
// the value is cached unless some underlying input is actually changed. When react can be re-rendering frequently
// this prevents the from un-necessary recalculation
export const selectNameAndCount = createSelector(
    selectName,
    selectCount,
    (name, count) => `${name} has count of ${count}`
);

// TODO try out a async thunk action: https://redux.js.org/tutorials/essentials/part-2-app-structure

/*
// Example of non-slice generated reducer
const initialState = {value: 0};
function counterReducer(state = initialState, action: UpdateCounterAction) {
    // Check to see if the reducer cares about this action
    if (action.type === 'counter/update') { // 'counter/increment'
        // If so, make a copy of `state`
        return {
        ...state,
        // and update the copy with the new value
        value: state.value + 1
        }
    }
    
    // otherwise return the existing state unchanged
    return state
}
*/