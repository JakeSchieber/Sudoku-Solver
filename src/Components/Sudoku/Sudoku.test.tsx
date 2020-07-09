import * as React from 'react';
//import TestRenderer from "react-test-renderer";
//import renderer from 'react-test-renderer';
import {SudokuSection, Sudoku, EMPTY_SUDOKU} from './Sudoku';
import ReactTestUtils from 'react-dom/test-utils';

// TODO: may make sense to instead put all Standard Sudoku logic (ie: logic, not UI) in a seperate class to enable that testing.
const GOOD_SUDOKU_GRID: SudokuSection = [
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

// TODO need to think about how to better test, for the moment just making a bad sudoku with 2 4s in first row, not even close to complete 
const BAD_SUDOKU_GRID: SudokuSection = [
    4, null, null, 3, null, 7, 6,null, null,
    4, null, 3, null, null, 2, 8, null,null,
    null, 2, 8, 5, 1, null, 7, null, 4,
    1, null, null, 8, 2, 3, 9, null, null,
    null, null, null, 7, 5, null, 1, 2 ,8,
    null, null, 4, null, null, 9, null, null, null,
    6, null, 2, null, 4, 8, 3, 5, 1,
    null, 3, null, null, 7, null, 4, null, null,
    null, null, 9, null, null, null, 2, 8, null,
];

/**
 * Generation logic
 * Line 1: 1->9
 * Line 2: Circular shift line 1 by 3 (ex: bringing 4-6 into box 0, 1-3 into box 2)
 * Line 3: Circular shift line 2 by 3 for same effect as above
 * Line 4->6: Copy of line 1-3 but circular shift each line by 1 (ex: box 0 has 1 in column 0, box 3 will put 1 in column 2)
 * Line 7-9: Copy of line 4->6 but circular shift each line by 1 for same effect as above
 */
const GOMPLETED_SUDOKU_GRID: SudokuSection = [
    1, 2, 3, 4, 5, 6, 7, 8, 9,
    4, 5, 6, 7, 8, 9, 1, 2, 3,
    7, 8, 9, 1, 2, 3, 4, 5, 6,
    9, 1, 2, 3, 4, 5, 6, 7, 8,
    3, 4, 5, 6, 7, 8, 9, 1, 2,
    6, 7, 8, 9, 1, 2, 3, 4, 5,
    8, 9, 1, 2, 3, 4, 5, 6, 7,
    2, 3, 4, 5, 6, 7, 8, 9, 1,
    5, 6, 7, 8, 9, 1, 2, 3, 4,
];

describe('Sudoku', () => {
    // TODO Create test for instantiation
    describe('Instantiation', () => {
        const sudokuGridSize = 9*9;
        test('Create Sudkou + basic square access', () => {
            expect(new Sudoku(new Array(sudokuGridSize).fill(null)).getSquare(0, 0)).toBe(null);
        });
        test('Fails to instantiate with incorrect sized input grid', ()=> {
            expect(() => {new Sudoku(new Array(sudokuGridSize + 1).fill(null))}).toThrowError();
            expect(() => {new Sudoku(new Array(sudokuGridSize - 1).fill(null))}).toThrowError();
        });
    })
    describe('Has conflicts', () => {
        test('Detects no conflicts', () => {
            // known empty
            expect(new Sudoku(EMPTY_SUDOKU).hasConflicts()).toBe(false);
            // not empty but known good
            expect(new Sudoku(GOOD_SUDOKU_GRID).hasConflicts()).toBe(false);
        });
        test('Detects Row conflicts', () => {
            let badSudoku = EMPTY_SUDOKU.slice();
            badSudoku[0] = 1; // 0th col of 0th row
            badSudoku[8] = 1; // last col of 0th row
            expect(new Sudoku(badSudoku).hasConflicts()).toBe(true);

            badSudoku = EMPTY_SUDOKU.slice();
            badSudoku[8*9] = 1; // 0th colmn of last row
            badSudoku[8*9 + 8] = 1; // last colmn of last row
            expect(new Sudoku(badSudoku).hasConflicts()).toBe(true);
        });
        test('Detects Column conflicts', () => {
            let badSudoku = EMPTY_SUDOKU.slice();
            badSudoku[0] = 1; // 0th col of 0th row
            badSudoku[8*9] = 1; // last col of 0th row
            expect(new Sudoku(badSudoku).hasConflicts()).toBe(true);

            badSudoku = EMPTY_SUDOKU.slice();
            badSudoku[8] = 1; // last colmn of 0th row
            badSudoku[8*9 + 8] = 1; // last column of last row
            expect(new Sudoku(badSudoku).hasConflicts()).toBe(true);
        });
        test('Detects Box conflicts', () => {
            let badSudoku = EMPTY_SUDOKU.slice();
            badSudoku[0] = 1; // 0th index of 0th box
            badSudoku[9*2+2] = 1; // last index of 0th box
            expect(new Sudoku(badSudoku).hasConflicts()).toBe(true);

            badSudoku = EMPTY_SUDOKU.slice();
            badSudoku[3*9 + 3] = 1; // 0th colmn of middle box
            badSudoku[5*9 + 5] = 1; // last index of middle box
            expect(new Sudoku(badSudoku).hasConflicts()).toBe(true);

            badSudoku = EMPTY_SUDOKU.slice();
            badSudoku[6*9 + 6] = 1; // 0th colmn of middle box
            badSudoku[8*9 + 8] = 1; // last index of middle box
            expect(new Sudoku(badSudoku).hasConflicts()).toBe(true);
        });
    });
    describe('Is solved', () => {
        test('Detects completed', () => {
            let sudoku = new Sudoku(GOMPLETED_SUDOKU_GRID);
            expect(sudoku.hasConflicts()).toBe(false);
            expect(sudoku.isSolved()).toBe(true);
        });

        test('Detects incomplete', () => {
            let notFullData_1 = GOMPLETED_SUDOKU_GRID.slice();
            notFullData_1[0] = null;
            expect(new Sudoku(notFullData_1).isSolved()).toBe(false);

            let notFullData_2 = GOMPLETED_SUDOKU_GRID.slice();
            notFullData_2[80] = null;
            expect(new Sudoku(notFullData_2).isSolved()).toBe(false);
        });

        test('Detects incorrect', () => {
            // Test complete sudoku has 1 at index 1, setting to 9 to force conflict
            let incorrect = GOMPLETED_SUDOKU_GRID.slice();
            incorrect[0] = 9;
            expect(new Sudoku(incorrect).isSolved()).toBe(false);
        });
    });
    describe('Row contains', () => {
        let sudoku = new Sudoku(GOOD_SUDOKU_GRID);
        test('Detects row does contain', () => {
            expect(sudoku.rowContains(0, 4)).toBe(true);
            expect(sudoku.rowContains(0, 4, 0)).toBe(false);
            expect(sudoku.rowContains(8, 9)).toBe(true);
            expect(sudoku.rowContains(8, 9, 2)).toBe(false);
        });
        test('Detects row does NOT contain', () => {
            expect(sudoku.rowContains(0, 1)).toBe(false);
            expect(sudoku.rowContains(8, 1)).toBe(false);
        });
        test('Throws expected errors', () => {
            expect(() => {sudoku.rowContains(-1, 1)}).toThrowError();
            expect(() => {sudoku.rowContains(9, 1)}).toThrowError();
        });
    });
    
    describe('Column contains', () => {
        let sudoku = new Sudoku(GOOD_SUDOKU_GRID);
        test('Detects column does contain', () => {
            expect(sudoku.columnContains(0, 4)).toBe(true);
            expect(sudoku.columnContains(0, 4, 0)).toBe(false);
            expect(sudoku.columnContains(8, 8)).toBe(true);
            expect(sudoku.columnContains(8, 8, 4)).toBe(false);
        });
        test('Detects column does NOT contain', () => {
            expect(sudoku.columnContains(0, 9)).toBe(false);
            expect(sudoku.columnContains(8, 2)).toBe(false);

            let test = EMPTY_SUDOKU.slice();
            test[8] = 1; // last colmn of 0th row
            expect(new Sudoku(test).columnContains(8, 1)).toBe(true);

            test = EMPTY_SUDOKU.slice();
            test[8*9 + 8] = 1; // last column of last row
            expect(new Sudoku(test).columnContains(8, 1)).toBe(true);
        });
        test('Throws expected errors', () => {
            expect(() => {sudoku.columnContains(-1, 1)}).toThrowError();
            expect(() => {sudoku.columnContains(9, 1)}).toThrowError();
        });
    });

    describe('Box contains', () => {
        let sudoku = new Sudoku(GOOD_SUDOKU_GRID);
        test('Detects box does contain (w/out exclusion)', () => {
            expect(sudoku.boxContains(0, 2)).toBe(true);
            expect(sudoku.boxContains(0, 3)).toBe(true);
            expect(sudoku.boxContains(0, 4)).toBe(true);
            expect(sudoku.boxContains(0, 8)).toBe(true);

            expect(sudoku.boxContains(8, 1)).toBe(true);
            expect(sudoku.boxContains(8, 2)).toBe(true);
            expect(sudoku.boxContains(8, 3)).toBe(true);
            expect(sudoku.boxContains(8, 4)).toBe(true);
            expect(sudoku.boxContains(8, 5)).toBe(true);
            expect(sudoku.boxContains(8, 8)).toBe(true);
        });
        test('Detects box does NOT contain (w/out exclusion)', () => {
            expect(sudoku.boxContains(0, 1)).toBe(false);
            expect(sudoku.boxContains(0, 5)).toBe(false);
            expect(sudoku.boxContains(0, 6)).toBe(false);
            expect(sudoku.boxContains(0, 7)).toBe(false);
            expect(sudoku.boxContains(0, 9)).toBe(false);

            expect(sudoku.boxContains(8, 6)).toBe(false);
            expect(sudoku.boxContains(8, 7)).toBe(false);
            expect(sudoku.boxContains(8, 9)).toBe(false);
        });
        test('Detects box does contain with exclusion)', () => {
            expect(sudoku.boxContains(0, 2, 7)).toBe(false);
            expect(sudoku.boxContains(0, 3, 5)).toBe(false);

            expect(sudoku.boxContains(8, 1, 2)).toBe(false);
            expect(sudoku.boxContains(8, 2, 6)).toBe(false);
        });
        test('Throws expected errors', () => {
            expect(() => {sudoku.boxContains(-1, 1)}).toThrowError();
            expect(() => {sudoku.boxContains(9, 1)}).toThrowError();
        });
    })
    
    describe('Get columns', () => {
        let sudoku = new Sudoku(GOOD_SUDOKU_GRID);
        test('Returns expected values', () => {
            expect(sudoku.getColumn(0)).toEqual([4,null,null,1,null,null,6,null,null]);
            expect(sudoku.getColumn(8)).toEqual([null,null,4,null,8,null,1,null,null]);
        });
        test('Throws expected errors', () => {
            expect(() => {sudoku.getColumn(-1)}).toThrowError();
            expect(() => {sudoku.getColumn(9)}).toThrowError();
        });
    });

    describe('Get Rows', () => {
        let sudoku = new Sudoku(GOOD_SUDOKU_GRID);
        test('Returns expected values', () => {
            expect(sudoku.getRow(0)).toEqual([4, null, null, 3, null, 7, 6,null, null]);
            expect(sudoku.getRow(8)).toEqual([null, null, 9, null, null, null, 2, 8, null]);
        });
        test('Throws expected errors', () => {
            expect(() => {sudoku.getRow(-1)}).toThrowError();
            expect(() => {sudoku.getRow(9)}).toThrowError();
        });
    });

    describe('Get Box', () => {
        let sudoku = new Sudoku(GOOD_SUDOKU_GRID);
        test('Returns expected values', () => {
            expect(sudoku.getBox(0)).toEqual([4, null, null, null, null, 3, null, 2, 8]);
            expect(sudoku.getBox(8)).toEqual([3, 5, 1, 4, null, null, 2, 8, null]);
        });
        test('Throws expected errors', () => {
            expect(() => {sudoku.getBox(-1)}).toThrowError();
            expect(() => {sudoku.getBox(9)}).toThrowError();
        });
    });

    describe('Get Box of square', () => {
        let sudoku = new Sudoku(GOOD_SUDOKU_GRID);
        test('Returns expected values', () => {
            expect(sudoku.getBoxOfSquare(0, 0)).toEqual(0);
            expect(sudoku.getBoxOfSquare(2, 2)).toEqual(0);
            expect(sudoku.getBoxOfSquare(3, 3)).toEqual(4);
            expect(sudoku.getBoxOfSquare(5, 5)).toEqual(4);
            expect(sudoku.getBoxOfSquare(6, 6)).toEqual(8);
            expect(sudoku.getBoxOfSquare(8, 8)).toEqual(8);
        });
        test('Throws expected errors', () => {
            expect(() => {sudoku.getBoxOfSquare(-1, 0)}).toThrowError();
            expect(() => {sudoku.getBoxOfSquare(9, 0)}).toThrowError();
            expect(() => {sudoku.getBoxOfSquare(0, -1)}).toThrowError();
            expect(() => {sudoku.getBoxOfSquare(0, 9)}).toThrowError();
        });
    });

    describe('Get index of square inside of box', () => {
        let sudoku = new Sudoku(GOOD_SUDOKU_GRID);
        test('Returns expected values', () => {
            expect(sudoku.getIndexOfSquareInLocalBox(0, 0)).toEqual(0);
            expect(sudoku.getIndexOfSquareInLocalBox(1, 1)).toEqual(4);
            expect(sudoku.getIndexOfSquareInLocalBox(2, 2)).toEqual(8);
            expect(sudoku.getIndexOfSquareInLocalBox(6, 6)).toEqual(0);
            expect(sudoku.getIndexOfSquareInLocalBox(7, 7)).toEqual(4);
            expect(sudoku.getIndexOfSquareInLocalBox(8, 8)).toEqual(8);
        });
        test('Throws expected errors', () => {
            expect(() => {sudoku.getIndexOfSquareInLocalBox(-1, 0)}).toThrowError();
            expect(() => {sudoku.getIndexOfSquareInLocalBox(9, 0)}).toThrowError();
            expect(() => {sudoku.getIndexOfSquareInLocalBox(0, -1)}).toThrowError();
            expect(() => {sudoku.getIndexOfSquareInLocalBox(0, 9)}).toThrowError();
        });
    });

    describe('Get global square index of square inside box', () => {
        let sudoku = new Sudoku(GOOD_SUDOKU_GRID);
        test('Returns expected values', () => {
            expect(sudoku.getGlobalIndexOfBoxSquare(0,0)).toEqual(0);
            expect(sudoku.getGlobalIndexOfBoxSquare(8,8)).toEqual(80);
        });
        test('Throws expected errors', () => {
            expect(() => {sudoku.getGlobalIndexOfBoxSquare(-1, 0)}).toThrowError();
            expect(() => {sudoku.getGlobalIndexOfBoxSquare(9, 0)}).toThrowError();
            expect(() => {sudoku.getGlobalIndexOfBoxSquare(0, -1)}).toThrowError();
            expect(() => {sudoku.getGlobalIndexOfBoxSquare(0, 9)}).toThrowError();
        });
    })
});