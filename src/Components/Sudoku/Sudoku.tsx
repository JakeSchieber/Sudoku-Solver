import * as React from 'react';
import './Sudoku.css';
import * as SampleSudokus from './SampleSudokus';

// Individual Sudoku square, number if filled, null if not
export type SudokuSquare = number | null;
// Either an entire Sudoku grid or a subsection like a Sudoke line, column or box including 9 squares
export type SudokuSection = Array<SudokuSquare>;

// Sudoku UI, uses Sudoku class for all logic and to pull in it's state/props
export interface SudokuUIState {
    sudoku: Sudoku;
}
export interface SudokuBoxProps {
    squares: SudokuSection;
    rootSize: number;
    providedLocations: Array<number>;
    conflictLocations: Array<number>;
    handleInput: (boxSquareIndex: number, val: string) => void; 
}
export interface SudokuSquareProps {
    value: SudokuSquare;
    isProvidedLocation: boolean;
    isConflictLocation: boolean;
    onInput: (val: string) => void; // callback it can pass value to
}

// TODO: these should be removed when future support for non-9x9 sudokus are supported which may have unique base + root row/column dimensions
// Core size dimension (usually 9), specifies number of rows, columns, boxes + the number of items inside each.
export const SUDOKU_BASE_SIZE = 9;
// Root dimension (3 for 9x9 sudoku), which specifies the X by X dimension of each box + # of contributions that each box has global grid lines/columns
export const SUDOKU_ROOT_SIZE = Math.sqrt(SUDOKU_BASE_SIZE);
export const SUDOKU_NUM_SQUARES = SUDOKU_BASE_SIZE * SUDOKU_BASE_SIZE;

/**
 * TODO: add a wrapping "SudokuGame" class which manages UI of users inputting, configuring and switching between different puzzles
 */

/**
 * Sudoku class, includes all logic required to describe, understand and interact with a Sudoku puzzle.
 * 
 * Allows initialization of "new" + "partially filled" Sudokus
 * If new, then pass in grid with null provided locations + then provided locations will be automatically calculated based on provided grid
 * If partially filled, then pass in grid of current values with "provided locations" specifying the global indexes that were provided at the start
 */
export class Sudoku {
    // Grid is a single array that contains all squares in the sudoku, getter helper functions are used to pull individual boxes, rows, + columns as needed
    public grid: SudokuSection;
    // Details the global grid indexes of the "known" sudoku locations that are provided by the puzzle, these cannot be changed by the user
    public providedLocations: Array<number>;
    // Details the global gird indexes of all locations that are currently in conflict with other box, row or column entries
    // TODO: both of the below will need to refactored when we add support for non-9x9 grids, not guaranateed for row/col root size to be equal (ex: 3x4 subsections) 
    // Core sudoku dimension (usually 9), specifies number of rows, columns, boxes + the number of items inside each.
    public baseSize: number;
    // Root dimension (3 for 9x9 sudoku), which specifies the X by X dimension of each box + # of contributions that each box has global grid lines/columns
    public rootSize: number;
    constructor(grid: SudokuSection, providedLocations?: Array<number>) {
        // TODO: add robust validation logic that works for non-unique configurations.
        if(grid.length === 0 || Math.sqrt(Math.sqrt(grid.length)) % 1 !== 0 || grid.length !== 81) {
            throw new Error(`Invalid grid provided. Length expected: ${SUDOKU_NUM_SQUARES}, Length provided: ${grid.length}`);
        }
        this.grid = grid;
        this.baseSize = SUDOKU_BASE_SIZE;
        this.rootSize = SUDOKU_ROOT_SIZE;
        
        // If "providedLocations" is null then we calculate based on the grid locations passed in.
        // If "providedLocations" is non-null then it means "grid" includes some partially-filled user-entries
        if(providedLocations !== undefined) {
            this.providedLocations = providedLocations;
        } else {
            this.providedLocations = [];
            for(let i=0; i<this.grid.length; i++) {
                if(this.grid[i] !== null) {
                    this.providedLocations.push(i);
                }
            }
        }

        /**
         * TODO: Validate whether the provided sudoku locations in the grid enable a valid solvable sudoku.  We
         * specifically don't want to validate all values in grid because its valid to instantiate a valid
         * sudoku but where the user just has invalid entries submitted.
         */
    }

    /**
     * Returns the value of the square at the specified global square index
     * @param globalSquareIndex global grid index of desired square
     * @returns current value at the specified location
     */
    getSquareAtGlobalGridIndex(globalSquareIndex: number): SudokuSquare {
        if(globalSquareIndex < 0 || globalSquareIndex >= this.grid.length) {
            throw new Error(`Invalid globalSquareIndex specified: (${globalSquareIndex}), must be equal to or between 0 and (${this.grid.length - 1})`);
        }
        return this.grid[globalSquareIndex];
    }

    /**
     * Returns the value of the square at the specified global row and column index
     * @param row global grid row of desired square
     * @param column global grid column of desired square
     * @returns current value at the specified location
     */
    getSquareAtGlobalColAndRow(row: number, column: number): SudokuSquare {
        if(row < 0 || row >= this.baseSize || column < 0 || column >= this.baseSize) {
            throw new Error(`Invalid row/column index: (${row}, ${column})`);
        }
        return this.getSquareAtGlobalGridIndex((row * this.baseSize) + column);
    }

    /**
     * Returns values from the requested row of the sudoku grid
     * @param row global grid index of the row to return
     * @return array of entries from the requested row 
     */
    getRow(row: number): SudokuSection {
        if(row < 0 || row >= this.baseSize) {
            throw new Error(`Invalid row index: ${row}`);
        }
        const startIndex = row * this.baseSize;
        return this.grid.slice(startIndex, startIndex + this.baseSize);
    }
    
    /**
     * Returns values from the requested column of the sudoku grid
     * @param column global grid index of the column to return
     * @return array of entries from the requested column 
     */
    getColumn(column: number): SudokuSection {
        if(column < 0 || column >= this.baseSize) {
            throw new Error(`Invalid column index: ${column}`);
        }
        let ret: SudokuSection = [];
        for(let row=0; row<this.baseSize; row++){
            ret.push(this.grid[row * this.baseSize + column]);
        }
        return ret;
    }

    /**
     * Returns values from the requested box of the sudoku grid
     * @param box global grid index of the box to return
     * @return array of entries from the requested column 
     */
    getBox(box: number): SudokuSection {
        if(box < 0 || box >= this.baseSize) {
            throw new Error(`Invalid box index: ${box}`);
        }
        // Determine what grid row + column that the box is in and determine indexes in grid
        const boxRowStart = Math.floor(box / this.rootSize) * this.rootSize;
        const boxColumnStart = (box % this.rootSize) * this.rootSize;
        // Loop through each row in the box and add all values to return
        let ret: SudokuSection = [];
        for(let row=0; row<this.rootSize; row++) {
            const lineStartIndex = (boxRowStart + row) * this.baseSize + boxColumnStart;
            ret.push(...this.grid.slice(lineStartIndex, lineStartIndex + this.rootSize));
        }
        return ret;
    }

    /**
     * Returns an array of Sudoku Sections. 1 for each box in the grid with each containing the values of its respective boxes
     */
    getBoxes(): SudokuSection[] {
        let boxes: SudokuSection[] = [];
        // Iterate through each Sudoku box
        for(let box=0; box<this.baseSize; box++) {
            boxes.push(this.getBox(box));
        }
        return boxes;
    }

    /**
     * Consumes a boxIndex and returns the local box indexes of the squares that were provided by the sudoku.
     * Prevents box components from needing to consume/understand the global indexes stored in the all-up "providedLocations"
     * @param boxIndex the desired box to pull local provided locations for
     */
    getLocalBoxProvidedLocations(boxIndex: number) {
        return this.getLocalBoxIndexesWithGlobalIntersections(boxIndex, this.providedLocations)
    }

    /**
     * Consumes a boxIndex and list of global conflict indexes and returns the local box indexes of the 
     * conflicts contained inside the speified box.  We pass in globalConflictLocations as an optimization
     * so that we don't have to maintain the conflicts in the state.
     * Prevents box components from needing to consume/understand the global indexes stored in the all-up "conflictLocations"
     * @param boxIndex the desired box to pull local conflict locations for
     */
    getLocalBoxConflictLocations(boxIndex: number, globalConflictLocations: Array<number>) {
        return this.getLocalBoxIndexesWithGlobalIntersections(boxIndex, globalConflictLocations)
    }

    /**
     * Returns the local square indexes inside a box that are contained inside some list of global indexes to look for. 
     * provided global indexes that are outside of the local box are not returned. Shared logic used by provided + conflict location logic.
     * @param boxIndex the desired box to pull local indexes for
     * @param globalIndexes a global array of indexes to look whether contained
     */
    getLocalBoxIndexesWithGlobalIntersections(boxIndex:number, globalIndexes: Array<number>) {
        if(boxIndex < 0 || boxIndex >= this.baseSize) {
            throw new Error(`Invalid box index requested: ${boxIndex}`);
        }
        let localIndexes: Array<number> = [];
        // Loop through each square in local box
        for(let square=0; square<this.baseSize; square++) {
            // Calculate the global index of the local square we are looking at
            const globalSquareIndex = this.getGlobalIndexOfBoxSquare(boxIndex, square);
            // If current square is one of the global squares that we are looking for then add its local box index to the return array.
            if(globalIndexes.includes(globalSquareIndex)) {
                localIndexes.push(square);
            }     
        }
        return localIndexes;
    }

    /**
     * Returns what box and local box inside that a square is located in based on its global row and column location
     * @param row global row square is located in
     * @param col global col square is located in
     * @returns boxIndex + localSquareIndexInBox of request square
     */
    getEnrichedSquareDetails(row: number, col: number) {
        if(row < 0 || row >= this.baseSize || col < 0 || col >= this.baseSize) {
            throw new Error(`Invalid row/column index: (${row}, ${col})`);
        }
        // Determine what box index that the square is inside
        const boxRow = Math.floor(row / this.rootSize);
        const boxCol = Math.floor(col / this.rootSize);
        const boxIndex = boxRow * this.rootSize + boxCol;

        // Determine what the squares index is inside the local box
        let localBoxRow = row % this.rootSize;
        let localboxCol = col % this.rootSize;
        const localSquareIndexInBox =  localBoxRow * this.rootSize + localboxCol;

        return {
            value: this.getSquareAtGlobalColAndRow(row, col),
            boxIndex: boxIndex,
            localSquareIndexInBox: localSquareIndexInBox,
        }
    }

    /**
     * Determine global gric index of square based on where based on what box the square is in and the square's
     * local index inside that box.
     * @param boxIndex index of box in grid
     * @param localSquareIndexInBox index of square inside local box
     */
    getGlobalIndexOfBoxSquare(boxIndex: number, localSquareIndexInBox: number) {
        if(boxIndex < 0 || boxIndex >= this.baseSize) {
            throw new Error(`Invalid boxIndex: ${boxIndex}`);
        }
        if(localSquareIndexInBox < 0 || localSquareIndexInBox >= this.baseSize) {
            throw new Error(`Invalid localSquareIndexInBox: ${localSquareIndexInBox}`);
        }
        // Scroll X lines for each row in the boxes above (ex: 3 lines for 1 box), then to correct line in your box
        // row, then past all columns in the boxes to the left of current box in row, then to individual column
        const boxRowStart = Math.floor(boxIndex / this.rootSize) * this.rootSize;
        const boxColumnStart = (boxIndex % this.rootSize) * this.rootSize;
        const squareRowStart = Math.floor(localSquareIndexInBox / this.rootSize);
        const squareColumnStart = (localSquareIndexInBox % this.rootSize);
        return (boxRowStart + squareRowStart) * this.baseSize + (boxColumnStart + squareColumnStart);
    }

    /**
     * Returns the grid row and column of a global grid index
     * @param globalSquareIndex request square's global index
     * @returns what grid row + column the square is located in
     */
    getRowAndColumnFromGlobalIndex(globalSquareIndex: number) {
        // Validate whether provided index is in range of grid
        if(globalSquareIndex < 0 || globalSquareIndex >= this.baseSize * this.baseSize) {
            throw new Error(`Invalid globalSquareIndex index: ${globalSquareIndex}`);
        }
        return {
            row: Math.floor(globalSquareIndex / this.baseSize),
            col: globalSquareIndex % this.baseSize,
        }
    }

    /**
     * Returns whether current grid has any conflicts
     */
    hasConflicts(): boolean {
        return this.calculateConflicts().length > 0;
    }

    /**
     * Return all grid indexes which have conflicts, empty array means no conflicts
     */
    calculateConflicts() {
        let conflicts = [];
        // Loop through each index inside of our grid, we loop based on row + col to help create method params
        for(let row=0; row<this.baseSize; row++) {
            for(let col=0; col<this.baseSize; col++) {
                let squareDetails = this.getEnrichedSquareDetails(row, col);
                // Don't check null values
                if(squareDetails.value === null) {
                    continue;
                }
                // Look for conflict in col, row + box, if found return true
                if(this.rowContains(row, squareDetails.value, col) 
                    || this.columnContains(col, squareDetails.value, row) 
                    || this.boxContains(squareDetails.boxIndex, squareDetails.value, squareDetails.localSquareIndexInBox)
                ){
                    conflicts.push(row*this.baseSize + col);
                }
            }
        }
        return conflicts;
    }

    /**
     * Returns whether the current row contains the requested value
     * @param row index of row in grid
     * @param val value to look for
     * @param excludeColumn optional local column index to ignore (ex: checking whether some square is in conflict with another entry)
     */
    rowContains(row: number, val: number, excludeColumn?: number): boolean {
        if(row < 0 || row >= this.baseSize) {
            throw new Error(`Invalid row index: ${row}`);
        }
        for(let column=0; column<this.baseSize; column++) {
            if(column !== excludeColumn && this.getSquareAtGlobalColAndRow(row,column) === val) {
                return true;
            }
        }
        return false;
    }

    /**
     * Returns whether the current column contains the requested value
     * @param column index of column in grid
     * @param val value to look for
     * @param excludeRow optional local row index to ignore (ex: checking whether some square is in conflict with another entry)
     */
    columnContains(column: number, val: number, excludeRow?: number): boolean {
        if(column < 0 || column >= this.baseSize) {
            throw new Error(`Invalid column index: ${column}`);
        }
        for(let row=0; row<this.baseSize; row++) {
            if(row !== excludeRow && this.getSquareAtGlobalColAndRow(row,column) === val) {
                return true;
            }
        }
        return false;
    }

    /**
     * Returns whether the current box contains the requested value
     * @param boxIndex index of box in grid
     * @param val value to look for
     * @param excludeLocalBoxIndex optional local box index to ignore (ex: checking whether some square is in conflict with another entry)
     */
    boxContains(boxIndex: number, val: number, excludeLocalBoxIndex?: number): boolean {
        let box = this.getBox(boxIndex);
        for(let square=0; square<this.baseSize; square++) {
            if(square !== excludeLocalBoxIndex && box[square] === val) {
                return true;
            }
        }
        return false;
    }

    /**
     * Set the value of a square in a grid to some specified value.
     * Cannot update a "providedLocation" of the sudoku.  Does not require submission to be accurate.
     * Can "clear" previous submission by providing "null" as value
     * @param gridIndex global grid index to update
     * @param val value to set grid index to
     * @returns "this", allows caller to update its local state to the latest sudoku as needed
     */
    setSquare(gridIndex: number, val: SudokuSquare) {
        if(this.providedLocations.includes(gridIndex)) {
            throw new Error("Cannot change a provided grid location");
        }
        if(gridIndex < 0 || gridIndex >= this.grid.length) {
            throw new Error(`Invalid grid index: ${gridIndex}`);
        }
        // Either null (ex: deleting entry) or number between 1 and baseSize is permissible (note: entries are 1-based unlike indexes)
        if(val != null && (val <= 0 || val > this.baseSize)) {
            throw new Error(`Invalid squre value: ${val}`);
        }
        // Update the sudoku with the entry and return "this" back to caller so that the react UI wrapper can update its state to reflect the change.
        const updatedGrid = [...this.grid];
        updatedGrid[gridIndex] = val;
        this.grid = updatedGrid;
        return this;
    }

    /**
     * Solves the current sudoku
     */
    solve(): SudokuSection {
        // TODO, start with basic recursion/backtracking solver
        throw new Error('Not implemented');
        return SampleSudokus.EMPTY_SUDOKU;        
    }

    /**
     * Returns boolean denoting whether the current Sudoku grid has been solved
     */
    isSolved() {
        // Validate that each cell has non-null value
        for(let i=0; i<this.grid.length; i++) {
           if(this.grid[i] === null) {
               return false;
           } 
        }
        // If full then Sudoku is solved when it has no conflicts
        return !this.hasConflicts();
    }
}

/**
 * SudokuUI class.  Enables a representation of a Sudoku board and allows for users to make entries.
 * UI includes differentiation between "provided" vs "user submitted" square values and lights up
 * conflicting squares if user's make conflicting entries.
 * 
 * State is based on a "Sudoku" class which this class wraps and which contains all sudoku game + board logic.
 */
export class SudokuUI extends React.Component<{}, SudokuUIState> {
    constructor(props: {}) {
        super(props);
        // TODO: build a wrapper that lets you select a grid type to test with
        // Test easy sudoku
        let sudoku = new Sudoku(SampleSudokus.EASY_SUDOKU);
            
        // Test pre-completed Sudoku
        //sudoku = new Sudoku(SampleSudokus.COMPLETED_SUDOKU_GRID);

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
            sudoku: sudoku
        }
    }

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
    parseSudokuInput(inputVal: string): SudokuSquare {
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

    /**
     * Render a full sudoku board.  For a standard 9x9 sudoku this would yield 9 sudoku boxes in a 3x3 grid 
     * where each box contains its own 3x3 grid of squares
     */
    render() {
        const boxData = this.state.sudoku.getBoxes();
        const boxRows: JSX.Element[] = [];
        const rootSize = this.state.sudoku.rootSize;
        const conflictLocations = this.state.sudoku.calculateConflicts();
        // Each sudoku contains X rows with X "Sudoku Boxes" in each.
        for(let boxRow=0; boxRow<rootSize; boxRow++) {
            const boxes: JSX.Element[] = [];
            for(let boxCol=0; boxCol<rootSize; boxCol++) {
                // Unique index for each box in the all up Sudoku.
                const boxIndex = (boxRow * rootSize) + boxCol;
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
                    // TODO: optimize by binding to a function callback instead of in-lining
                    onInput={(val:any) => {
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
    // TODO: Create additional type of "unfilled square" which can show which numbers are valid possibilities
    // for the user to enter
    // If square is a "Provided location" then it has special styling and user is not able to update its value
    if(props.isProvidedLocation) {
        return (
            <input
                className={`
                    sudoku-square
                    provided-square-location
                    ${props.isConflictLocation ? 'conflict-square' : ''}
                `}
                value={props.value == null ? "" : props.value}
                type="text"
                disabled // User is not able to edit provided values
            />
        );
    }
    // Standard non-"provided location". Binds to callback function to allow for users to submit values + edit
    return (
        <input
            className={`
                sudoku-square
                ${props.isConflictLocation ? 'conflict-square' : ''}
            `}
            value={props.value == null ? "" : props.value}
            // Note: using "text" instead of "number" for net styling purposes
            type="text"
            // TODO: update handler to use function reference instead of in-line. https://reactjs.org/docs/handling-events.html
            onChange={(e) => {
                props.onInput(e.target.value);
            }}
        />
    );
}