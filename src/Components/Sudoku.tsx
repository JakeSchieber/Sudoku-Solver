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
}
export interface SudokuSquareProps {
    value: SudokuSquare;
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
    public baseSize: number;
    public rootSize: number;
    constructor(grid: SudokuSection) {
        // TODO: Need to redefine the error string now
        // TODO must be greater than zero also I think 4x4 might be the smallest with 4 boxes, 1x1, explore
        // Standard sudoku is 9x9, but 1x1, 4x4, 9x9, exc.
        // TODO does this go deeper???  If we go up to 16 is it necessary to do 16 boxes or can I do 3 boxes as well???
        // Checks whether grid is non-zero and that it's sqrt(sqrt) is an integer
        // TODO better understand the math here, can sqrt(sqrt) be reduced to some logarithmic function
        if(grid.length === 0 || Math.sqrt(Math.sqrt(grid.length)) % 1 !== 0) {
            throw new Error(`Invalid grid provided. Length expected: ${SUDOKU_NUM_SQUARES}, Length provided: ${grid.length}`);
        }
        this.grid = grid;
        this.baseSize = SUDOKU_BASE_SIZE;
        this.rootSize = SUDOKU_ROOT_SIZE;
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

    // TODO, start with basic recursion solver
    solve(): SudokuSection {
        throw new Error('Not implemented');
        return EMPTY_SUDOKU;        
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

    boxContains(boxIndex:number, val: number, excludeLocalBoxIndex?: number): boolean {
        let box = this.getBox(boxIndex);
        for(let square=0; square<this.baseSize; square++) {
            if(square !== excludeLocalBoxIndex && box[square] === val) {
                return true;
            }
        }
        return false;
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

    render() {
        const boxData = this.state.sudoku.getBoxes();
        const lines: JSX.Element[] = [];
        const rootSize = Math.sqrt(boxData.length);
        for(let line=0; line<rootSize; line++) {
            const boxes: JSX.Element[] = [];
            for(let box=0; box<rootSize; box++) {
                const boxIndex = (line * rootSize) + box;
                boxes.push(
                    <SudokuBox key={boxIndex} squares={boxData[boxIndex]} />
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
    const rootSize = Math.sqrt(props.squares.length);
    for(let line=0; line<rootSize; line++) {
        const squares: JSX.Element[] = [];
        for(let square=0; square<rootSize; square++) {
            const squareIndex = (line*rootSize) + square;
            squares.push(
                <SudokuSquare key={squareIndex} value={props.squares[squareIndex]} />
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
    //  
    // { /*
    // TODO, implement prop to determine which squares were provided initially
    let editable = false;
    if(!editable) {
        return (
            <div className="sudoku-square">{props.value}</div>
        );
    }
    return (
        <input
            className="sudoku-square" 
            //readOnly
            // TODO we need to send a handler function down to this so that this square doesn't have to 
            // know whether 
            onChange={(e) => {
                console.log(e);
                // props.value = parseInt(e.target.value)
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