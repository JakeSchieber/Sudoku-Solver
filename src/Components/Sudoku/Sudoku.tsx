// Individual Sudoku square, number if filled, null if not
export type SudokuSquareValue = number | null;
// Either an entire Sudoku grid or a subsection like a Sudoke line, column or box including 9 squares
export type SudokuSection = Array<SudokuSquareValue>;

// TODO: these should be removed when future support for non-9x9 sudokus are supported which may have unique base + root row/column dimensions
// Core size dimension (usually 9), specifies number of rows, columns, boxes + the number of items inside each.
export const SUDOKU_BASE_SIZE = 9;
// Root dimension (3 for 9x9 sudoku), which specifies the X by X dimension of each box + # of contributions that each box has global grid lines/columns
export const SUDOKU_ROOT_SIZE = Math.sqrt(SUDOKU_BASE_SIZE);
export const SUDOKU_NUM_SQUARES = SUDOKU_BASE_SIZE * SUDOKU_BASE_SIZE;

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
            // Validate that all specified providedLocations have some value
            for(let i=0; i<providedLocations.length; i++) {
                if(this.grid[providedLocations[i]] === null) {
                    throw new Error(`Value at provided index location cannot be null: ${providedLocations[i]}`)
                }
            }
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

    get gridSize() {
        return this.grid.length;
    }

    /**
     * Returns the value of the square at the specified global square index
     * @param globalSquareIndex global grid index of desired square
     * @returns current value at the specified location
     */
    getSquare(globalSquareIndex: number): SudokuSquareValue {
        if(globalSquareIndex < 0 || globalSquareIndex >= this.grid.length) {
            throw new Error(`Invalid globalSquareIndex specified: (${globalSquareIndex}), must be equal to or between 0 and (${this.grid.length - 1})`);
        }
        return this.grid[globalSquareIndex];
    }

    /**
     * Returns an enriched set of details about the square at the specified global square index
     * @param row global row square is located in
     * @param col global col square is located in
     * @returns boxIndex + localSquareIndexInBox of request square
     */
    getEnrichedSquareDetails(globalSquareIndex: number) {
        // Get details, helper functions also validate index location
        const value = this.getSquare(globalSquareIndex)
        const location = this.getRowAndColumnFromGlobalIndex(globalSquareIndex);
        
        // Determine what box index that the square is inside
        const boxRow = Math.floor(location.row / this.rootSize);
        const boxCol = Math.floor(location.col / this.rootSize);
        const boxIndex = boxRow * this.rootSize + boxCol;

        // Determine what the squares index is inside the local box
        let localBoxRow = location.row % this.rootSize;
        let localboxCol = location.col % this.rootSize;
        const localSquareIndexInBox =  localBoxRow * this.rootSize + localboxCol;

        return {
            value: value,
            row: location.row,
            col: location.col,
            boxIndex: boxIndex,
            localSquareIndexInBox: localSquareIndexInBox,
        }
    }

    /**
     * Returns values from the requested row of the sudoku grid
     * @param row global row index to return
     * @returns array of entries from the requested row 
     */
    getRow(row: number): SudokuSection {
       return this.getSudokuSection(this.getGlobalIndexesInRow(row));
    }

    /**
     * Returns values from the requested column of the sudoku grid
     * @param column global column index to return
     * @returns array of entries from the requested column 
     */
    getColumn(column: number): SudokuSection {
        return this.getSudokuSection(this.getGlobalIndexesInColumn(column));
    }

    /**
     * Returns values from the requested box of the sudoku grid
     * @param box global box index to return
     * @returns array of entries from the requested column 
     */
    getBox(box: number): SudokuSection {
        return this.getSudokuSection(this.getGlobalIndexesInBox(box));
    }

    /**
     * Returns values at the specified global indexes in the sudoku
     * @param indexes global indexes to pull
     * @returns corresponding values at index
     */
    getSudokuSection(indexes: Array<number>) {
        let squares = [];
        for(let i=0; i<indexes.length; i++) {
            squares.push(this.getSquare(indexes[i]));
        }
        return squares;
    }

    /**
     * Calculates the gloabl indexes contained in the specified row
     * @param row global row index to return
     * @returns corresponding global index locations
     */
    getGlobalIndexesInRow(row: number) {
        if(row < 0 || row >= this.baseSize) {
            throw new Error(`Invalid row index: ${row}`);
        }
        let indexes = [];
        for(let col=0; col<this.baseSize; col++) {
            indexes.push(row * this.baseSize + col);
        }
        return indexes;
    }

    /**
     * Calculates the gloabl indexes contained in the specified column
     * @param column global column index to return
     * @returns corresponding global index locations
     */
    getGlobalIndexesInColumn(column: number) {
        if(column < 0 || column >= this.baseSize) {
            throw new Error(`Invalid column index: ${column}`);
        }
        let indexes = [];
        for(let row=0; row<this.baseSize; row++){
            indexes.push(row * this.baseSize + column);
        }
        return indexes;
    }

    /**
     * Calculates the gloabl indexes contained in the specified box
     * @param box global box index to return
     * @returns corresponding global index locations
     */
    getGlobalIndexesInBox(box: number) {
        if(box < 0 || box >= this.baseSize) {
            throw new Error(`Invalid box index: ${box}`);
        }
        // Determine what grid row + column that the box is in and determine indexes in grid
        const boxRowStart = Math.floor(box / this.rootSize) * this.rootSize;
        const boxColumnStart = (box % this.rootSize) * this.rootSize;
        // Loop through each row in the box 
        let indexes = [];
        for(let row=0; row<this.rootSize; row++) {
            // Loop through each column in the box and add all values to return
            const startIndex = (boxRowStart + row) * this.baseSize + boxColumnStart;
            for(let col=0; col<this.rootSize; col++) {
                indexes.push(startIndex + col);
            }
        }
        return indexes;
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
     * Returns the globalIndex corresponding to the provided row and column locations
     * @param row square's row index location
     * @param col square's column index location
     * @returns corresponding globalIndex
     */
    getGlobalIndexFromRowAndColumn(row: number, col: number) {
        if(row < 0 || row >= this.baseSize || col < 0 || col >= this.baseSize) {
            throw new Error(`Invalid row/col index: (${row}, ${col}), expected (0,0)->(${this.baseSize}, ${this.baseSize})`);
        }
        return this.baseSize * row + col;
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
                const globalIndex = this.getGlobalIndexFromRowAndColumn(row, col);
                let squareDetails = this.getEnrichedSquareDetails(globalIndex);
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
        const rowValues = this.getRow(row);
        for(let column=0; column<this.baseSize; column++) {
            if(column !== excludeColumn && rowValues[column] === val) {
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
        const colValues = this.getColumn(column);
        for(let row=0; row<this.baseSize; row++) {
            if(row !== excludeRow && colValues[row] === val) {
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
    setSquare(gridIndex: number, val: SudokuSquareValue) {
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
    solve() {
        // TODO, start with basic recursion/backtracking solver

        // Debug: attempt to solve the sudoku
        // TODO: move to the solve function
        let possibilites = this.getPossibilities();
        console.log("solve");
        console.log(possibilites);
        //while(possibilites.solvableSquares.length > 0) {
            for(let i=0; i<possibilites.solvableSquares.length; i++) {
                const square = possibilites.solvableSquares[i];
                this.setSquare(square.gridIndex, square.value);
            }
            possibilites = this.getPossibilities();
            console.log(possibilites);
        //}

        // return the current updated sudoku so React can update its state
        return this;     
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

    getPossibilities() {
        // TODO: should possibilities just be caked into the Sudoku Class directly?  It seems that
        // this would solve a lot of help access functions...
        
        // Initial possibilities (empty sudoku) are 1->9 in each grid location
        let possibilities: Array<Array<number>> = new Array(this.gridSize).fill([1,2,3,4,5,6,7,8,9]);

        // loop through each non-null value in the grid and remove possibilites
        for(let i=0; i<this.gridSize; i++) {
            const square = this.getEnrichedSquareDetails(i);
            if(square.value !== null) {
                // Reduce current square possibilities to its known value
                possibilities[i] = [square.value];

                // Remove row conflicts
                // Get all indexes in the row
                const rowIndexes = this.getGlobalIndexesInRow(square.row);
                // Loop through each column in the row, but skip the column that has the known value
                for(let col=0; col<rowIndexes.length; col++) {
                    if(col !== square.col) {
                        // Filter the known value out from being a possibility from other squares in the row
                        possibilities[rowIndexes[col]] = possibilities[rowIndexes[col]].filter((val) => {
                            return val !== square.value;
                        });
                    }
                }

                // Remove col conflicts
                const colIndexes = this.getGlobalIndexesInColumn(square.col);
                for(let row=0; row<colIndexes.length; row++) {
                    if(row !== square.row) {
                        possibilities[colIndexes[row]] = possibilities[colIndexes[row]].filter((val) => {
                            return val !== square.value;
                        });
                    }
                }

                // Remove box conflicts
                // TODO: refactor variable naming, enriched square details too
                const boxIndexes = this.getGlobalIndexesInBox(square.boxIndex);
                for(let x=0; x<boxIndexes.length; x++) {
                    if(x !== square.localSquareIndexInBox) {
                        possibilities[boxIndexes[x]] = possibilities[boxIndexes[x]].filter((val) => {
                            return val !== square.value;
                        });
                    }
                }

                // TODO: when any of these actions reduces a possiblity Array to zero we can set the square value
                // and recurse.  Something to think about (individual possibily reducer?)
                // This may need to be its own class all together.
            }
        }

        // After reducing possibilities, determine which cells that we have found a solution for
        let solvableCells = [];
        for(let i=0; i<possibilities.length; i++) {
            if(possibilities[i].length == 1 && this.getSquare(i) === null) {
                // console.log(`location ${i}, value ${possibilities[i][0]}`);
                solvableCells.push({
                    gridIndex: i,
                    value: possibilities[i][0]
                });
            }
        }

        return {
            possibilities: possibilities,
            solvableSquares: solvableCells
        };
    }
}

/**
 * Return the specified indexes from the generic grab bag
 * Enables easy reuse of the row/col/box index helper functions when users managing a 2nd custom grid representation 
 * @param bag grab bag of values to pull from
 * @param indexes desired indexes to pull
 * @returns array of values stored at the requested indexes
 */
export function getIndexesfromBag<T>(bag: Array<T>, indexes: Array<number>): Array<T> {
    let retIndexes: Array<T> = [];
    for(let i=0; i<indexes.length; i++) {
        retIndexes.push(bag[indexes[i]]);
    }
    return retIndexes;
}
