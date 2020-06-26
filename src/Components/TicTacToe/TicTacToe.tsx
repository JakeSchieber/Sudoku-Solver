import React from 'react';
import './TicTacToe.css';

interface TicTacToeState {
  history: Array<BoardSquares>;
  stepNumber: number;
  xIsNext: boolean;
  selectedStepNumber: number;
  sortMovesDecreasing: boolean;
}
interface BoardProps extends BoardSquares {
  highlightSquares: Array<number>;
  onClick: (i: number) => void;
}
interface BoardSquares {
  squares: Array<string | null>;
  lastClickedRow: number;
  lastclickedColumn: number;
}
interface SquareProps {
  value: string | null;
  winHighlight: boolean;
  onClick: () => void;
}
// WinState will determine which team one, null if no one
// line will specify the 3 cells that won if there is one
interface WinState {
  winner: string | null;
  line: Array<number>;
}

// Pure functional component. No constructor because no dependency on state, does not extend React Component
// Just contains a return which allows for it to be rendered and used as a JSX element
function Square(props: SquareProps) {
  return (
    <button 
      className={`square ${props.winHighlight ? 'square-winner' : ''}`}
      // Overwriting native button onClick event to call the onClick function that we pass in props
      onClick={props.onClick}
    >
      {props.value}
    </button>
  );
}

// Board has props sent in from TicTacToe but no State (equivalent to "<..., {}>")
class Board extends React.Component<BoardProps> {
  renderSquare(i: number) {
    // Note we need to enclose with () for JS to keep from adding semicolon on line break
    return (
      // They only thing we need to tell the squares is which square they are
      // Squares are considered "Controlled components" because the board has full control over them.
      // We pass the squares value down from the Squares Prop set by the TicTacToe parent component
      // We pass down a callback function to the square down from Board based on props sent in by TicTacToe
      // We bind the argument to it based on the square index that we rendered (not in props/state, must be instantiated somehow?)
      // TODO - I don't fully understand how that binding is functionally handled
      <Square
        key={i}
        value={this.props.squares[i]}
        winHighlight={this.props.highlightSquares.includes(i)}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  render() {
    // Note React lets you insert variables with JSX + JSX[] directly inside your render return, just wrap with "{}"
    const board: JSX.Element[] = [];
    for(let row = 0; row < 3; row++) {
      const rows: JSX.Element[] = [];
      for(let col = 0; col < 3; col++) {
        rows.push(this.renderSquare(row * 3 + col));
      }
      board.push(<div key={row} className="ttt-board-row">{rows}</div>);
    }
    return (
      <div>{board}</div>
    );

    /*
    // Alternate way of handling
    const rows = [0,1,2];
    const cols = [0,1,2];
    const board = rows.map((rowStep, move) => {
      return (
        <div className="ttt-board-row">
          {
            cols.map((colStep, move) => {
              return this.renderSquare(rowStep * 3 + colStep);
            })
          }
        </div>
      );
    });
    return (
      <div>{board}</div>
    );
    
    // Stock way of handling
    return (
      <div>
        <div className="ttt-board-row">
          {this.renderSquare(0)}
          {this.renderSquare(1)}
          {this.renderSquare(2)}
        </div>
        <div className="ttt-board-row">
          {this.renderSquare(3)}
          {this.renderSquare(4)}
          {this.renderSquare(5)}
        </div>
        <div className="ttt-board-row">
          {this.renderSquare(6)}
          {this.renderSquare(7)}
          {this.renderSquare(8)}
        </div>
      </div>
    );
    */
  }}

// TicTacToe class, highest level. No props (ie: {}) but does have state which it uses to control all underlying components
export class TicTacToe extends React.Component<{}, TicTacToeState> {
  // Typescript needs to know to expect nothing in board props
  constructor(props: {}) {
    // In react all component classes that have a constructor should start with a super(props) call
    // This causes the constructor on the extended React Component to be called to inherit its functionality
    super(props);
    // Initialize state, 1 entry in history which is empty board, stepNumber starts at 0 and X goes first
    this.state = {
      history: [{
        squares: Array(9).fill(null),
        lastClickedRow: -1,
        lastclickedColumn: -1,
      }],
      selectedStepNumber: 0,
      stepNumber: 0,
      xIsNext: true,
      sortMovesDecreasing: false,
    }
  }

  // HandleClick is defined by TicTacToe and then passed into Board and then into square.  This ensures that all logic
  // for the game is entirely contained here and black boxed from any of the underlying components
  // This is why "top down" building is generally the easiest way to approach React apps (all logic + state built first at top level)
  handleClick(i: number) {
    // When we handle a click we could either be at the latest context or in a past state if user used "JumpTo"
    // On click we then grab the full history up to whatever step the user is viewing + in the process drop any
    // history that is still in the record after the currently step which the user now intends to write over
    // "Current Step" is then reset to where ever the move occurred contextually

    // Note: React is built around "immutablity", we do not mutate state or props directly otherwise updates may not be detected.
    // So we create shallow copy of current state, make any changes to that copy directly, and then set state over that.  
    // setState will overwrite any of the properties passed without impacting any existing state properties that were not passed in
    // By doing this we are making the Object immutable (ie: React only needs to look for pointer changes)
    // Goal in react is to create "pure components" - its return value is only determined by inputs + always has same output
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    const winState = calculateWinner(squares);

    // if square already clicked or the game is already complete (either return non-null) then don't register click
    if(squares[i] || winState.winner) {
      return;
    }

    // Determine what row + column were clicked based on selected square
    const lastClickedRow = Math.floor(i / 3) + 1;
    const lastclickedColumn = i % 3 + 1;

    // Proceed game forward, add X/O to selected square based on whose turn it is then update history with latest version of the board
    // increment step number and toggle whose turn is next 
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    this.setState({
      // We use concat instead of push because it creates 1 new array instead of mutating the original (not really necessary since we used slice)
      history: history.concat([{
        squares: squares,
        lastClickedRow: lastClickedRow,
        lastclickedColumn: lastclickedColumn,
      }]),
      stepNumber: history.length,
      selectedStepNumber: history.length,
      xIsNext: !this.state.xIsNext
    });
  }
  
  // Jump to lets you change current step represented on the board but does not impact history
  // Only changes stepNumber and whether xIsNext and the games render automatically shows that
  // History is not impacted until a user clicks where the click handler then takes care of the rest, this lets us
  // view the past without losing those moves unless the user decides to do so.
  // X always starts first so we determine whether "X is next" based on whether step number is even (% 2)
  // TODO - "xIsNext" could be obfusicated entirely to render + handleClick
  jumpTo(step: number) {
    this.setState({
      stepNumber: step,
      selectedStepNumber: step,
      xIsNext: (step % 2) === 0
    });
  }

  toggleMoveSort() {
    this.setState({
      sortMovesDecreasing: !this.state.sortMovesDecreasing,
    });
  }

  render() {
    const history = this.state.history;
    // If user used "jumpTo" then current is not guaranteed to be the latest, here we show specifically what StepNumber is selected
    const current = history[this.state.stepNumber];
    const winState = calculateWinner(current.squares);
    const winner = winState.winner;
    const selectedStepNumber = this.state.selectedStepNumber;

    // Create a list of buttons that show the user each step made and where clicking lets them reset what step the board is reflecting
    // TODO: no reason to show the latest state, no value in clicking to show the state that the user is already on.
    let moves = history.map((step, move) => {
      const desc = move ?
        `Go to move # ${move} (${step.lastClickedRow},${step.lastclickedColumn})`:
        'Go to game start';

      return (
        // Need to add "key" for optimization
        <li key={move}>
          <button className={`${move === selectedStepNumber ? "selected-move" : ""}`} onClick={() => this.jumpTo(move)}>{desc}</button>
        </li>
      );
    });

    // If user has toggled the move sort order then reverse the order the moves are reflected in the list
    // We do this here instead of above so that we don't impact the expected sort order of history and it how a move index
    // is bound to each step
    if(this.state.sortMovesDecreasing) {
      moves = moves.reverse();
    }

    // If somehow has already won then say who won, if not then show who gets to go next
    let status: string;
    let matchFailure = false;
    if (winner) {
      status = 'Winner: ' + winner;
    } else if (this.state.stepNumber == 9) {
      status = "WINNER: NONE... the only winning move is not to play.";
      matchFailure = true;
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }

    return (
      <div className="ttt">
        <div className="ttt-board">
          <Board
            squares={current.squares}
            lastClickedRow={current.lastClickedRow}
            lastclickedColumn={current.lastclickedColumn}
            highlightSquares={winState.line}
            // TODO, I still don't fully understand how this implicit binding of i works, it just implicitly expects that
            // it will be called with some arguments?  I guess thats the value of typescript here?
            onClick={(i) => this.handleClick(i)}
          />
        </div>
        <div className="ttt-info">
          <div className={`${matchFailure ? 'matchFailureStatus' : ''}`}>{status}</div>
          <ol>{moves}</ol>
          <label className="ttc-info-sort">
            <input type="checkbox" onClick={() => this.toggleMoveSort()}/>
            <span>Sort latest moves first</span>
          </label>
        </div>
      </div>
    );
  }
}

// TODO create our own version of the Winner function 
function calculateWinner(squares: Array<string | null>): WinState {
  // possible winning scenarios
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  // loop through all winning scenarios
  for (let i = 0; i < lines.length; i++) {
    // spread the winning indexes from this scenario
    const [a, b, c] = lines[i];
    // Check that 0th index is not null and that its equal to 1st + 2nd index
    // Note === compares value and type, == does type "coercion" before doing a comparison (ex: 0 == '0')
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      // Return the winner if true
      return {
        winner: squares[a],
        line: [a, b, c],
      };
    }
  }
  // Return null if no winner is found
  return {
    winner: null,
    line: [],
  };
}