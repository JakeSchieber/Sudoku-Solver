// Note: we use configureStore() from redux toolkit which simplifies the boilerplate of creating a redux store
// and adds other functionality.  This automatically adds support for redux-thunk, immer, composeWithDevTools 
import { configureStore } from '@reduxjs/toolkit';
import { counterReducer, userReducer } from './reducers'

// Other config properties include middleware, preloadedState, enhancers, exc.
const store = configureStore({
    reducer: {
        counter: counterReducer,
        user: userReducer
    }
})
export default store;

export type RootState = ReturnType<typeof store.getState>;

// TODO: play around with action dispatch by hand
// store.subscribe(() => console.log(store.getState()))
// store.dispatch({ type: 'INCREMENT' })
// store.dispatch({ type: 'INCREMENT' })
// store.dispatch({ type: 'DECREMENT' })

/*
// Example of stock boiler plate without using configureStore from redux toolkit
export default function configureStore(preloadedState: any) {
    const middlewares: any = [];
    const middlewareEnhancer = applyMiddleware(...middlewares);

    const enhancers: any = [];
    // Note: out of box redux would compose with "compose(..)", we use "composeWithDevTools(..)" from DevTools
    // extension which provides extra functionality in browser dev tools
    const composedEnhancers = composeWithDevTools(...enhancers);

    const store = createStore(rootReducer, preloadedState, composedEnhancers);

    // TODO: look into default configure store function

    // TODO: add support for hot reloading while in dev environment
    // https://redux.js.org/recipes/configuring-your-store
    
    return store;
}
*/