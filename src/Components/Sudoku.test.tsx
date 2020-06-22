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
});