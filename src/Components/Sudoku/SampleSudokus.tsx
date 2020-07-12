import {SudokuSection} from './Sudoku';

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

/**
 * Generation logic
 * Line 1: 1->9
 * Line 2: Circular shift line 1 by 3 (ex: bringing 4-6 into box 0, 1-3 into box 2)
 * Line 3: Circular shift line 2 by 3 for same effect as above
 * Line 4->6: Copy of line 1-3 but circular shift each line by 1 (ex: box 0 has 1 in column 0, box 3 will put 1 in column 2)
 * Line 7-9: Copy of line 4->6 but circular shift each line by 1 for same effect as above
 */
export const COMPLETED_SUDOKU_GRID: SudokuSection = [
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