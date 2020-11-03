import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    increment,
    selectCount,
    increaseByAmount,
    selectName,
    selectNameAndCount
} from './../../reducers'

export function ReduxSandbox() {
    // Pull in selectors and connect to store
    const count = useSelector(selectCount);
    const name = useSelector(selectName);
    const nameAndCount = useSelector(selectNameAndCount);
    const dispatch = useDispatch();

    // State: initializes a state for "counter" in component, the function to update it is mapped
    // to setCounter, initalized to state of 0
    const [counter, setCounter] = useState(2);

    // Action: code that is called when an update to state is needed, references the state
    // update function called above, is passed the old state which we name as prevCounter
    // and then updates to +1
    const incrementAdd = () => {
        setCounter(prevCounter => prevCounter + 1);
    }

    // View: the UI definition based on current state
    // details current state and maps onClick to our action handler
    //
    return (
        <React.Fragment>
            <div>
                Current value: {count}
            </div>
            <div>
                Increment: <button onClick={() => dispatch(increment())}>Do it!</button>
            </div>
            <div>
                Increment by {counter}: <button onClick={() => dispatch(increaseByAmount(counter))}>Do it!</button>
            </div>
            <div>
                name: {name}
            </div>
            <div>
                nameAndCount: {nameAndCount}
            </div>
        </React.Fragment>
    )
}