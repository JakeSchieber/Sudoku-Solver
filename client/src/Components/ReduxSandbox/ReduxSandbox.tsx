import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    increment,
    selectCount,
    increaseByAmount,
    selectName,
    selectNameAndCount
} from './../../reducers'
import { Stack, CompoundButton, IStackTokens, PrimaryButton } from '@fluentui/react';

const stackTokens: IStackTokens = { childrenGap: 40 };

export function ReduxSandbox() {
    // Pull in selectors and connect to store
    const count = useSelector(selectCount);
    const name = useSelector(selectName);
    const nameAndCount = useSelector(selectNameAndCount);
    const dispatch = useDispatch();

    // State: initializes a state for "counter" in component, the function to update it is mapped
    // to setCounter, initalized to state of 0
    const [addAmount, setAddAmount] = useState(2);

    // Action: code that is called when an update to state is needed, references the state
    // update function called above, is passed the old state which we name as prevCounter
    // and then updates to +1
    const incrementAddAmount = () => {
        setAddAmount(addAmount => addAmount + 1);
    }
    const decrementAddAmount = () => {
        setAddAmount(addAmount => addAmount - 1);
    }

    // Make a test API call
    const makeTestApiCall = () => {
        fetch('/api/test')
            .then(res => res.json())
            .then(data => {
                console.log(data);
                console.log(data.value);
            })
            .catch(err => console.log(err));
    }

    // View: the UI definition based on current state
    // details current state and maps onClick to our action handler
    return (
        <React.Fragment>
            <h3>Current redux state:</h3>
            <div>
                Name: {name}
            </div>
            <div>
                 Counter value: {count}
            </div>
            <div>
                 Concatenate with selector: '{nameAndCount}'
            </div>

            <h3>Set amount to add:</h3>
            <div>Current "Amount to Add" (from local state): {addAmount}</div>

            <Stack horizontal tokens={stackTokens}>
                <CompoundButton 
                    secondaryText={`Increase incrementor by 1`}
                    primary
                    onClick={ incrementAddAmount }
                > 
                    Increment
                </CompoundButton>
                <CompoundButton 
                    secondaryText="Decrease incrementor by 1"
                    onClick={ decrementAddAmount }
                > 
                    Decrement
                </CompoundButton>
            </Stack>

            <h3>Increase counter by:</h3>
            <Stack horizontal tokens={stackTokens}>
                <CompoundButton 
                    secondaryText={`Change by ${addAmount}`} 
                    primary
                    onClick={() => dispatch(increaseByAmount(addAmount))}
                >
                    The current 'Add amount'
                </CompoundButton>
                <CompoundButton 
                    secondaryText="Just increment by 1"
                    onClick={() => dispatch(increment())}
                > 
                    +1
                </CompoundButton>
            </Stack>

            <h3>Temp: Server test</h3>
            <PrimaryButton 
                onClick={ makeTestApiCall }
            > 
                Make test call to server
            </PrimaryButton>

        </React.Fragment>
    )
}