import * as React from 'react';
import './Sudoku.css';

// Individual Sudoku square
export type SudokuSquare = number | null;
// Either a Sudoke line, column or box including 9 squares
export type SudokuSection = Array<SudokuSquare>;
// Remoing 9x9 grid, simpler data structure will make it more straightforward to clone + pass around
// 9x9 Grid of Sudoku squares (Can be list of rows, columns, or boxes)
// export type SudokuGrid = Array<SudokuSection>;
// Individual Sudoku square location on the grid
/*
export interface SudokuSquareLocation {
    row: number;
    col: number;
}
*/
export interface SudokuUIState {
    sudoku: Sudoku;
}
export interface SudokuBoxProps {
    squares: SudokuSection;
    providedLocations: Array<number>;
    handleInput: (boxSquareIndex: number, val: number) => void; 
}
export interface SudokuSquareProps {
    value: SudokuSquare;
    isProvidedLocation: boolean;
    onInput: (val: number) => void; // callback it can pass value to
}

/*
TODO:
Define data structure for sudoku
Build out in squares - try it by hand and then look online for something better
Build basic functionality for detecting whether it has any errors
*/

export const EMPTY_SUDOKU: SudokuSection = [
    null, null, null, null, null, null, null, null, null,
    null, null, null, null, null, null, null, null, null,
    null, null, null, null, null, null, null, null, null,
    null, null, null, null, null, null, null, null, null,
    null, null, null, null, null, null, null, null, null,
    null, null, null, null, null, null, null, null, null,
    null, null, null, null, null, null, null, null, null,
    null, null, null, null, null, null, null, null, null,
    null, null, null, null, null, null, null, null, null,
];

// https://sudoku.com/easy/
export const EASY_SUDOKU: SudokuSection = [
    4, null, null, 3, null, 7, 6,null, null,
    null, null, 3, null, null, 2, 8, null,null,
    null, 2, 8, 5, 1, null, 7, null, 4,
    1, null, null, 8, 2, 3, 9, null, null,
    null, null, null, 7, 5, null, 1, 2 ,8,
    null, null, 4, null, null, 9, null, null, null,
    6, null, 2, null, 4, 8, 3, 5, 1,
    null, 3, null, null, 7, null, 4, null, null,
    null, null, 9, null, null, null, 2, 8, null,
];

// Future iteration can try adding support for unique sized sudokus (ex: 12x12), does need to be square.
// Core size dimension (usually 9), specifies number of rows, columns, boxes + the number of items inside each.
export const SUDOKU_BASE_SIZE = 9;
// Root dimension (usually 3), specifies number of values provided by each box to each section (ie: 3 values from each box for 1-9)
export const SUDOKU_ROOT_SIZE = Math.sqrt(SUDOKU_BASE_SIZE);

//export const SUDOKU_NUM_BOXES = 9;
//export const SUDOKU_NUM_ROWS = SUDOKU_NUM_BOXES;
//export const SUDOKU_NUM_COLUMNS = SUDOKU_NUM_BOXES;
export const SUDOKU_NUM_SQUARES = SUDOKU_BASE_SIZE * SUDOKU_BASE_SIZE;

export class Sudoku {
    public grid: SudokuSection;
    public providedLocations: Array<number>;
    public baseSize: number;
    public rootSize: number;
    constructor(grid: SudokuSection, providedLocations?: Array<number>) {
        // TODO: Need to redefine the error string now
        // TODO must be greater than zero also I think 4x4 might be the smallest with 4 boxes, 1x1, explore
        // Standard sudoku is 9x9, but 1x1, 4x4, 9x9, exc.
        // TODO does this go deeper???  If we go up to 16 is it necessary to do 16 boxes or can I do 3 boxes as well???
        // Checks whether grid is non-zero and that it's sqrt(sqrt) is an integer
        // TODO better understand the math here, can sqrt(sqrt) be reduced to some logarithmic function
        if(grid.length === 0 || Math.sqrt(Math.sqrt(grid.length)) % 1 !== 0) {
            throw new Error(`Invalid grid provided. Length expected: ${SUDOKU_NUM_SQUARES}, Length provided: ${grid.length}`);
        }
        // TODO should we be using a pointer to an array or a copy of it?
        this.grid = grid;
        
        // If provided locations is null then we calculate based on the grid locations passed in. If provided then we 
        // use that directly.  This allows for us to create partially filled in Sudokus where own of the values
        // used to create the sudoku was already filled in by the user and is not guaranteed to be part of the solution
        // TODO, this seems like a weird way to handle this
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
        
        this.baseSize = SUDOKU_BASE_SIZE;
        this.rootSize = SUDOKU_ROOT_SIZE;
        // TODO: implement a hisotrical stack so that we can make additions and then walk them back as well as reset.
        // May be interesting intersection with knownlocations logic as well
    }

    getRow(row: number): SudokuSection {
        if(row < 0 || row >= this.baseSize) {
            throw new Error(`Invalid row index: ${row}`);
        }
        const startIndex = row * this.baseSize;
        return this.grid.slice(startIndex, startIndex + this.baseSize);
    }
    
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

    // TODO can we build a shared error handler for the above 3 functions to sanitize?
    // TODO this function can be split apart to be more modular, function to get row/column for the box/square as needed
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

    getSquare(row: number, column: number): SudokuSquare {
        if(row < 0 || row >= this.baseSize || column < 0 || column >= this.baseSize) {
            throw new Error(`Invalid row/column index: (${row}, ${column})`);
        }
        return this.grid[(row * this.baseSize) + column];
    }

    // TODO figure out standard commenting style, likely the below and include elsewhere
    /**
     * Convert our 9x9 grid into 9 arrays 1 per each 3x3 box.
     */
    getBoxes(): SudokuSection[] {
        let boxes: SudokuSection[] = [];
        // Iterate through each Sudoku box
        for(let box=0; box<this.baseSize; box++) {
            boxes.push(this.getBox(box));
        }
        return boxes;
    }

    // TODO, never wrapped this up
    // TODO needs tests
    getProvidedIndexesInBox(box: number): Array<number> {
        /* 
        Note: try to be clever so that this can easily scale to when we build out bigger sudokus (ex: don't
        include a static check of 3 rows).  Summarize to a .filter that checks the conditions and adds? 
        Maybe a for loop through each 
        */

        if(box < 0 || box >= this.baseSize) {
            throw new Error(`Invalid box index: ${box}`);
        }
        const boxRowStart = Math.floor(box / this.rootSize) * this.rootSize;
        const boxColumnStart = (box % this.rootSize) * this.rootSize;
        let providedIndexesInBox: Array<number> = [];
        // Loop through each row and column inside the local box
        for(let row=0; row<this.rootSize; row++) {
            for(let col=0; col<this.rootSize; col++) {
                // TODO: convert local location to global, check if its included, if it is then add that local
                // location to the return value.  An ideal optimization here would be to create boxes +
                // their provided list at the same time but we won't do that, so just figure out what 
                // seems to be the best approach...   
                
                const globalSquareIndex = (boxRowStart + row) * this.baseSize + boxColumnStart + col;
                if(this.providedLocations.includes(globalSquareIndex)) {
                    providedIndexesInBox.push(row*this.rootSize + col);
                }         
            }
        }
        return providedIndexesInBox;
    }

    // TODO, start with basic recursion solver
    solve(): SudokuSection {
        throw new Error('Not implemented');
        return EMPTY_SUDOKU;        
    }

    // TODO, think about this and how to integrate
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

    /**
     * Consumes global square index inside of grid and returns what box index that the square is inside
     * @param row global square row location
     * @param col global square column locaiton
     */
    getBoxOfSquare(row: number, col: number) {
        if(row < 0 || row >= this.baseSize || col < 0 || col >= this.baseSize) {
            throw new Error(`Invalid row/column index: (${row}, ${col})`);
        }
        const boxRow = Math.floor(row / this.rootSize);
        const boxCol = Math.floor(col / this.rootSize);
        return boxRow * this.rootSize + boxCol;
    }

    /**
     * Consumes global square index inside of grid and returns a square's index inside its local box
     * @param row global square row location
     * @param col global square column locaiton
     */
    getIndexOfSquareInLocalBox(row: number, col: number) {
        if(row < 0 || row >= this.baseSize || col < 0 || col >= this.baseSize) {
            throw new Error(`Invalid row/column index: (${row}, ${col})`);
        }
        let boxRow = row % this.rootSize;
        let boxCol = col % this.rootSize;
        return boxRow * this.rootSize + boxCol;
    }

    /**
     * Determine global location of square in grib based on where square based on its local location in box
     * and the boxe's global location in the grid
     * @param box index of box in grid
     * @param boxSquareIndex index of square in box
     */
    getGlobalIndexOfBoxSquare(box: number, boxSquareIndex: number) {
        if(box < 0 || box >= this.baseSize) {
            throw new Error(`Invalid box index: ${box}`);
        }
        if(boxSquareIndex < 0 || boxSquareIndex >= this.baseSize) {
            throw new Error(`Invalid boxSquareIndex index: ${box}`);
        }
        // Scroll X lines for each row in the boxes above (ex: 3 lines for 1 box), then to correct line in your box
        // row, then past all columns in the boxes to the left of current box in row, then to individual column
        // TODO, we use this code in a lot of places, can we build a helper?
        const boxRowStart = Math.floor(box / this.rootSize) * this.rootSize;
        const boxColumnStart = (box % this.rootSize) * this.rootSize;
        const squareRowStart = Math.floor(boxSquareIndex / this.rootSize);
        const squareColumnStart = (boxSquareIndex % this.rootSize);
        return (boxRowStart + squareRowStart) * this.baseSize + (boxColumnStart + squareColumnStart);
    }

    /*
    Ways to valideate count the number of each digit in each row, col and box
    */
    hasConflicts(): boolean {
        // Loop through each index inside of our grid, we loop based on row + col to help create method params
        for(let row=0; row<this.baseSize; row++) {
            for(let col=0; col<this.baseSize; col++) {
                let val = this.getSquare(row, col);
                // Don't check null values
                if(val === null) {
                    continue;
                }
                // Look for conflict in col, row + box, if found return true
                if(this.rowContains(row, val, col) 
                    || this.columnContains(col, val, row) 
                    || this.boxContains(this.getBoxOfSquare(row, col), val, this.getIndexOfSquareInLocalBox(row, col))) {
                    return true;
                }
            }
        }
        // No conflicts found
        return false;
    }

    rowContains(row: number, val: number, excludeColumn?: number): boolean {
        if(row < 0 || row >= this.baseSize) {
            throw new Error(`Invalid row index: ${row}`);
        }
        for(let column=0; column<this.baseSize; column++) {
            if(column !== excludeColumn && this.getSquare(row,column) === val) {
                return true;
            }
        }
        return false;
    }

    columnContains(column: number, val: number, excludeRow?: number): boolean {
        if(column < 0 || column >= this.baseSize) {
            throw new Error(`Invalid column index: ${column}`);
        }
        for(let row=0; row<this.baseSize; row++) {
            if(row !== excludeRow && this.getSquare(row,column) === val) {
                return true;
            }
        }
        return false;
    }

    boxContains(boxIndex: number, val: number, excludeLocalBoxIndex?: number): boolean {
        let box = this.getBox(boxIndex);
        for(let square=0; square<this.baseSize; square++) {
            if(square !== excludeLocalBoxIndex && box[square] === val) {
                return true;
            }
        }
        return false;
    }

    /*
    TODO lots to consider here, better function name (doesn't set current square it returns new sudoku with an updated square)
    We need a way to update the state of the sudoku with setState otherwise React won't allow us to.

    What to add next:
    *Pass through knownLocations down into square so that they look visually different from the provided locations
    *What do we do if a user enters a bad value, do we want to light it and its conflicts up as read? Where do we pull that from
    */
    setSquare(gridIndex: number, val: number) {
        if(this.providedLocations.includes(gridIndex)) {
            throw new Error("Cannot change a provided grid location");
        }
        if(gridIndex < 0 || gridIndex >= this.grid.length) {
            throw new Error(`Invalid grid index: ${gridIndex}`);
        }
        if(val <= 0 || val > this.baseSize) {
            throw new Error(`Invalid squre value: ${val}`);
        }
        // Return pointer to net new Sudoku with copy of grid that has requested square filled in
        // TODO, we need to separate out known locations, can't be part of the initialized
        const beforeGrid = [...this.grid];
        beforeGrid[gridIndex] = val;
        return new Sudoku(beforeGrid);
    }
}

export class SudokuUI extends React.Component<{}, SudokuUIState> {
    constructor(props: {}) {
        super(props);
        this.state = {
            sudoku: new Sudoku(EASY_SUDOKU)
        }
        // TODO: should we have initial grid included, or a property for "known" value (ie: can't be changed by a user?)
        // as-is users can go in and change a known value, we'll need this anyways to make the enterred values ligher...
    }

    // TODO where should "History" go, is the type of logic that we should have on the react component instead of 
    // Sudoku class?  That seems to be so.
    /* TODO: Needs to know both the location that was updated and the value that it was updated with
    Should also consider sanitizing the input (ex: what if an update to a known location is selected */
    handleInput(box: number, boxSquareIndex: number, val: number) {
        // Make call to base sudoku class which should then make a call to render by default if the data changes.
        // Where to sanitize, here or there?
        // TODO: how to handle when this is a bad input?  Allow but set flags to light up the bad squares in the chart?
        const globalSquareIndex = this.state.sudoku.getGlobalIndexOfBoxSquare(box, boxSquareIndex);
        let newSudoku = this.state.sudoku.setSquare(globalSquareIndex, 9);
        this.setState({
            sudoku: newSudoku
        });
    }

    /* 
    Next big TODO, optimize per notes below, need to think of way to pass in the known locations
    in box format, is that really just another helper funciton or can we be more clever with it? 

    Current approach is to recommend on this.getKnownLocationsInBox
    */
    render() {
        const boxData = this.state.sudoku.getBoxes();
        const lines: JSX.Element[] = [];
        const rootSize = Math.sqrt(boxData.length);
        for(let line=0; line<rootSize; line++) {
            // TODO: convert this to just a boxData.map return
            // TODO look into use of "line" and potentially refactor to row
            const boxes: JSX.Element[] = [];
            for(let box=0; box<rootSize; box++) {
                const boxIndex = (line * rootSize) + box;
                // TODO: is there any reason that this box style format shouldn't just be part of the state
                // why do we have provided locations store in this format to begin with?...
                const providedBoxLocations = this.state.sudoku.getProvidedIndexesInBox(boxIndex);
                boxes.push(
                    <SudokuBox 
                        key={boxIndex} 
                        squares={boxData[boxIndex]} 
                        handleInput={(squareIndex, val) => {
                            this.handleInput(boxIndex, squareIndex, val);
                        }}
                        providedLocations={providedBoxLocations}
                    /> 
                );
            }
            lines.push(
                <div key={line} className="sudoku-grid-line">
                    {boxes}
                </div>
            );
        }
        return (
            <div className="sudoku">
                <div className="sudoku-board">
                    {lines}
                </div>
            </div>
        );
        /*
        return (
            <div className="sudoku">
                <div className="sudoku-board">
                    <div className="sudoke-grid-line">
                        <SudokuBox squares={boxes[0]} />
                        <SudokuBox squares={boxes[1]} />
                        <SudokuBox squares={boxes[2]} />
                    </div>
                    <div className="sudoke-grid-line">
                        <SudokuBox squares={boxes[3]} />
                        <SudokuBox squares={boxes[4]} />
                        <SudokuBox squares={boxes[5]} />
                    </div>
                    <div className="sudoke-grid-line">
                        <SudokuBox squares={boxes[6]} />
                        <SudokuBox squares={boxes[7]} />
                        <SudokuBox squares={boxes[8]} />
                    </div>
                </div>
            </div>
        );
        */
    }
}

// TODO - should I be passing in rowLength as a prop so that this is more pure/functional?
function SudokuBox(props: SudokuBoxProps) {
    const lines: JSX.Element[] = [];
    // TODO: rootsize should be passed in as a prop
    const rootSize = Math.sqrt(props.squares.length);
    for(let line=0; line<rootSize; line++) {
        const squares: JSX.Element[] = [];
        for(let square=0; square<rootSize; square++) {
            const squareIndex = (line*rootSize) + square;
            squares.push(
                <SudokuSquare 
                    key={squareIndex}
                    value={props.squares[squareIndex]} 
                    isProvidedLocation={props.providedLocations.includes(squareIndex)}
                    onInput={(val:any) => {
                        // TODO, can we improve this loop + subsquently its index logic
                        props.handleInput(line*rootSize + square, val);
                    }}
                /> /* TODO: work out call back handler first */
            );
        }
        lines.push(
            <div key={line} className="sudoku-box-line">
                {squares}
            </div>
        );
    }
    return (
        <div className="sudoku-box">
            {lines}
        </div>
    );
    /*
    return (
        <div className="sudoku-box">
            <div className="sudoku-box-line">
                <SudokuSquare value={props.squares[0]} />
                <SudokuSquare value={props.squares[1]} />
                <SudokuSquare value={props.squares[2]} />
            </div>
            <div className="sudoku-box-line">
                <SudokuSquare value={props.squares[3]} />
                <SudokuSquare value={props.squares[4]} />
                <SudokuSquare value={props.squares[5]} />
            </div>
            <div className="sudoku-box-line">
                <SudokuSquare value={props.squares[6]} />
                <SudokuSquare value={props.squares[7]} />
                <SudokuSquare value={props.squares[8]} />
            </div>
        </div>
    );
    */
}

function SudokuSquare(props: SudokuSquareProps) {
    // TODO, implement prop to determine which squares were provided initially
    // TODO, may be more optimal to bind a callback, this causes a new callback function to be created
    // on each render: https://reactjs.org/docs/handling-events.html
    if(props.isProvidedLocation) {
        return (
            <div className="sudoku-square">{props.value}</div>
        );
    }
    // TODO: provided location need to not be bold, we also need to build error class to show here.
    // TODO: it appears that the top and right line need an extra margin, not perfect as-is (missing 1px)
    return (
        <input
            className="sudoku-square" 
            //readOnly
            // TODO implement sanitization (limited to number) and overwrite any existing value so that more 
            // than 1 character can't be added, this won't work when we support 2 character entries for +9 sudokus
            onChange={(e) => {
                props.onInput(parseInt(e.target.value));
            }}
            type="text"
            maxLength={1}
            value={props.value == null ? "" : props.value}
            
        />
    );
    /*
    <button 
        className={`square ${props.winHighlight ? 'square-winner' : ''}`}
        // Overwriting native button onClick event to call the onClick function that we pass in props
        onClick={props.onClick}
      >
        {props.value}
      </button>
    */
  }