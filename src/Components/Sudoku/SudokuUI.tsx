import * as React from 'react';
import { 
    Sudoku, 
    SudokuSquareValue, 
    SudokuSection, 
    getIndexesfromBag 
} from './Sudoku';
import './Sudoku.css';
import * as SampleSudokus from './SampleSudokus';
import { PrimaryButton } from '@fluentui/react';

// Sudoku UI, uses Sudoku class for all logic and to pull in it's state/props
export interface SudokuUIState {
    sudoku: Sudoku;
    showPossibilities: boolean;
}
export interface SudokuBoxProps {
    squares: SudokuSection;
    rootSize: number;
    providedLocations: Array<number>;
    conflictLocations: Array<number>;
    possibilities: Array<Array<number>>;
    handleInput: (boxSquareIndex: number, val: string) => void; 
}
export interface SudokuSquareProps {
    value: SudokuSquareValue;
    isProvidedLocation: boolean;
    isConflictLocation: boolean;
    possibilities: Array<number>;
    onInput: (val: string) => void; // callback it can pass value to
}

/**
 * TODO: add a wrapping "SudokuGame" class which manages UI of users inputting, configuring and switching between different puzzles
 */

/**
 * SudokuUI class.  Enables a representation of a Sudoku board and allows for users to make entries.
 * UI includes differentiation between "provided" vs "user submitted" square values and lights up
 * conflicting squares if user's make conflicting entries.
 * 
 * State is based on a "Sudoku" class which this class wraps and which contains all sudoku game + board logic.
 */
export class SudokuUI extends React.Component<{}, SudokuUIState> {
    // TODO: should we be relying on all props instead of state to manage the sudoku?
    constructor(props: {}) {
        super(props);
        // TODO: build a wrapper that lets you select a grid type to test with
        // Test easy sudoku
        // let sudoku = new Sudoku(SampleSudokus.EASY_SUDOKU);
        // let sudoku = new Sudoku(SampleSudokus.HARD_SUDOKU); 
        // Test pre-completed Sudoku
        //sudoku = new Sudoku(SampleSudokus.COMPLETED_SUDOKU_GRID);

        // Parsing straight from a copy/paste of Sudoku.com API
        // Easy: https://sudoku.com/api/getLevel/easy
        let sudokuGridString = "130865009008004102000120000007600903915400087603017050000000345006703890009080006";
        // Medium: https://sudoku.com/api/getLevel/medium
        // let sudokuGridString = "000000000680905400000003071470000806102008000000064102706340010305800000090200700";
        // Hard: https://sudoku.com/api/getLevel/hard
        // let sudokuGridString = "760000092010060000900070500000049200602500000500000031300210054100006020004000009";
        // Expert: https://sudoku.com/api/getLevel/expert
        // let sudokuGridString = "000005406000000000000208050013090807004000001000800009008001900020730000500000070";
        let sudokuGridCharArray = sudokuGridString.split('');
        let sudokuGrid: Array<SudokuSquareValue> = [];
        for(let i=0; i<sudokuGridCharArray.length; i++) {
            if(sudokuGridCharArray[i] == "0") {
                sudokuGrid.push(null);
            } else {
                sudokuGrid.push(parseInt(sudokuGridCharArray[i]))
            }
        }
        let sudoku = new Sudoku(sudokuGrid);

        // Test almost completed Sudoku, enter 1 into the 1st cell
        //let almostCompleteSudoku = SampleSudokus.COMPLETED_SUDOKU_GRID.slice();
        //almostCompleteSudoku[0] = null;
        //sudoku = new Sudoku(almostCompleteSudoku);
        // Use below: sudoku: new Sudoku(almostCompleteSudoku)
        this.state = {
            // Test easy sudoku
            //sudoku: new Sudoku(SampleSudokus.EASY_SUDOKU)
            // Test pre-completed Sudoku
            //sudoku: new Sudoku(SampleSudokus.COMPLETED_SUDOKU_GRID)
            sudoku: sudoku,
            showPossibilities: true
        }  
    }

    /*
    componentDidMount() {
        // "sizes": [4,9],    // 4x4, 9x9
        let size = 9;
        // "levels": [1,2,3], // easy, medium, hard
        let level = 1;
        //fetch("https://sudoku.com/api/getLevel/hard", {
        fetch(`http://www.cs.utep.edu/cheon/ws/sudoku/new/?size=${size}&level=${level}`, {
            method: "GET",
            headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Content-Type": "text/plain",
                    
            },
        })
            .then(res => {
                console.log("Made it");
                console.log(res);
                return res.json();
            })
            .then(
                (result) => {
                    console.log(result);
                },
                (error) => {
                    console.log("Error");
                    console.log(error);
                }
            )
    }
    */

    /**
     * Handler function to enable users to make entries into the sudoku
     * @param box 
     * @param boxSquareIndex 
     * @param inputVal 
     */
    handleInput(box: number, boxSquareIndex: number, inputVal: string) {
        // Update the sudoku with entry, "current" sudoku returned so react can detect and then render a state update
        // Note: unless we update the state React will automatically clear any input entry to match its previous value
        // TODO: this seems like the wrong way to go about this, look into later (setting state property to current value)
        const globalSquareIndex = this.state.sudoku.getGlobalIndexOfBoxSquare(box, boxSquareIndex);
        let updatedSudoku = this.state.sudoku.setSquare(globalSquareIndex, this.parseSudokuInput(inputVal))
        this.setState({
            sudoku: updatedSudoku,
        });
    }

    /**
     * Parses Sudoku Square entries for consumpution.  If input can be parsed and is within range then the corresponding int
     * value is returned.  If value is outside of range then last character is parsed (ie: user can type to replace a number without backspace).
     * Returns null on empty value or when cannot be parsed via the preceeding stated logic.
     * @param inputVal string enterred as input into a Sudoku Square
     */
    parseSudokuInput(inputVal: string): SudokuSquareValue {
        // TODO: should this santizer be located directly in the wrapped sudoku class directly?
        // Attempt to parse input directly
        let parsedVal = parseInt(inputVal);
        // If value cannot be parsed to a number then then treat as "null"
        if(Number.isNaN(parsedVal)) {
            return null;
        }
        // If parsed value is out of range then try to parse last enterred character
        // Allows a user to replace an existing entry by just enterring a new one without hitting backspace
        if(parsedVal < 1 || parsedVal > this.state.sudoku.baseSize) {
            let reducedParsedVal = parseInt(inputVal.charAt(inputVal.length - 1));
            // If last charcter cannot be parsed to int or is out of range then treat as "null"
            if(Number.isNaN(reducedParsedVal) || reducedParsedVal > this.state.sudoku.baseSize) {
                return null;
            }
            // Successfull parse of last character
            return reducedParsedVal;
        } 
        // Successful parse of inputVal
        return parsedVal;
    }

    handleSolveClick = () => {
        let updatedSudoku = this.state.sudoku.solve();
        this.setState({
            sudoku: updatedSudoku,
        });
    }

    /**
     * Render a full sudoku board.  For a standard 9x9 sudoku this would yield 9 sudoku boxes in a 3x3 grid 
     * where each box contains its own 3x3 grid of squares
     */
    render() {
        // TODO: is this a valid approach to more cleanly access sudoku?
        const sudoku = this.state.sudoku;
        const boxData = this.state.sudoku.getBoxes();
        const boxRows: JSX.Element[] = [];
        const rootSize = this.state.sudoku.rootSize;
        const conflictLocations = this.state.sudoku.calculateConflicts();
        const possibilities = this.state.sudoku.getPossibilities().possibilities;

        // Each sudoku contains X rows with X "Sudoku Boxes" in each.
        for(let boxRow=0; boxRow<rootSize; boxRow++) {
            const boxes: JSX.Element[] = [];
            for(let boxCol=0; boxCol<rootSize; boxCol++) {
                // Unique index for each box in the all up Sudoku.
                const boxIndex = (boxRow * rootSize) + boxCol;

                // TODO: our logic for when to show possibilities is absolute trash
                const indexesInBox = sudoku.getGlobalIndexesInBox(boxIndex);
                const boxPossibilities = getIndexesfromBag<Array<number>>(possibilities, indexesInBox);
                boxes.push(
                    <SudokuBox 
                        key={boxIndex} 
                        squares={boxData[boxIndex]}
                        rootSize={rootSize}
                        // Input handler, passed down into underlying Sudoku Box + Square
                        handleInput={(squareIndex, val) => {
                            this.handleInput(boxIndex, squareIndex, val);
                        }}
                        providedLocations={this.state.sudoku.getLocalBoxProvidedLocations(boxIndex)}
                        conflictLocations={this.state.sudoku.getLocalBoxConflictLocations(boxIndex, conflictLocations)}
                        possibilities={boxPossibilities}
                    /> 
                );
            }
            boxRows.push(
                <div key={boxRow} className="sudoku-grid-line">
                    {boxes}
                </div>
            );
        }
        const isSolved = this.state.sudoku.isSolved();
        return (
            <div>
                <div className="sudoku">
                    <div className="sudoku-board">
                        {boxRows}
                    </div>
                </div>
                <div className="sudoku-status">
                    {isSolved ? "You have finished the sudoku!" : "Keep at it :)" }
                </div>
                <div className="actions">
                    <PrimaryButton
                        text="Solve"
                        onClick={this.handleSolveClick}
                    />
                </div>
            </div>
            
        );
    }
}

/**
 * React compontent for a Sudoku box.  For a standard 9x9 sudoku this would yield a 3x3 grid of sudoku squares/cells
 * @param props 
 */
function SudokuBox(props: SudokuBoxProps) {
    const rows: JSX.Element[] = [];
    const rootSize = props.rootSize;
    // Create X rows of sudokus cells. Standard sudoku boxes will have 3
    for(let row=0; row<rootSize; row++) {
        const squares: JSX.Element[] = [];
        // Create X cols in each row. Standard sudoku boxes will have 3
        for(let col=0; col<rootSize; col++) {
            // localSquareIndex, unique for each square contained in the box. Standard sudoku will have 9 (3x3)
            const localSquareIndex = (row*rootSize) + col;
            squares.push(
                <SudokuSquare 
                    key={localSquareIndex}
                    value={props.squares[localSquareIndex]} 
                    isProvidedLocation={props.providedLocations.includes(localSquareIndex)}
                    isConflictLocation={props.conflictLocations.includes(localSquareIndex)}
                    possibilities={props.possibilities[localSquareIndex]}
                    onInput={(val: string) => {
                        props.handleInput(row*rootSize + col, val);
                    }}
                />
            );
        }
        rows.push(
            <div key={row} className="sudoku-box-line">
                {squares}
            </div>
        );
    }
    return (
        <div className="sudoku-box">
            {rows}
        </div>
    );
}

/**
 * React component for a single sudoku square inside a sudoku box.
 * "Provided" values get a special styling and are immutable. Non-provided locations allow for users to edit.
 * Enables special stylying for when the square is "in conflict" with another square in the global grid.
 * @param props 
 */
function SudokuSquare(props: SudokuSquareProps) {
    // If square is a "Provided location" then it has special styling and user is not able to update its value
    if(props.isProvidedLocation) {
        // Note: using disabled input here to get easier consistent styling
        return (
            <input
                className={`
                    sudoku-square
                    provided-square-location
                    ${props.isConflictLocation ? 'conflict-square' : ''}
                    provided-possibilities
                `}
                value={props.value == null ? "" : props.value}
                type="text"
                disabled // User is not able to edit provided values
            />
        );
    }

    // TODO: Create some prop that determines whether showing possibilities or not
    // pass that into the above so that they fill the cell in better
    // TODO: is it possible when once the table is selected its replaced with an input?
    return (
        <table className={`
            sudoku-square
            sudoku-square-possibilities
        `}>
            <tr>
                <td>{props.possibilities.includes(1) ? 1 : ""}</td>
                <td>{props.possibilities.includes(2) ? 2 : ""}</td>
                <td>{props.possibilities.includes(3) ? 3 : ""}</td>
            </tr>
            <tr>
                <td>{props.possibilities.includes(4) ? 4 : ""}</td>
                <td>{props.possibilities.includes(5) ? 5 : ""}</td>
                <td>{props.possibilities.includes(6) ? 6 : ""}</td>
            </tr>
            <tr>
                <td>{props.possibilities.includes(7) ? 7 : ""}</td>
                <td>{props.possibilities.includes(8) ? 8 : ""}</td>
                <td>{props.possibilities.includes(9) ? 9 : ""}</td>
            </tr>
        </table> 
    );

    /*
    // Standard non-"provided location". Allows users to submit values + edit
    const onInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        props.onInput(e.target.value);
    }
    return (
        <input
            className={`
                sudoku-square
                ${props.isConflictLocation ? 'conflict-square' : ''}
            `}
            value={props.value == null ? "" : props.value}
            type="text" // Note: using "text" instead of "number" for styling purposes
            onChange={onInput}
        />
    );
    */
}