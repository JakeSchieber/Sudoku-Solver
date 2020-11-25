import React from 'react';

// TODO: think about how we could just run these... this is not the right way to approach this
export default function CodeExcercises() {
    console.log(hasAllUniqueCharacters('abcdef'));
    console.log(hasAllUniqueCharacters('aa'));
    console.log(hasAllUniqueCharacters('aA'));
    console.log(hasAllUniqueCharacters('abcdefa'));
    
    return (
        <span>It's working</span>
    );
}

// Is Unique implement alg to determine if a string has all unique characters
// What if you cannot use unique characters
function hasAllUniqueCharacters(aString: string): boolean {
    let set = new Set();

    for(let letter of aString) {
        if(set.has(letter)) {
            return false;
        }
        set.add(letter);
    }
    return true;
}