import { animate, keyframes, state, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, OnInit, Signal, computed, signal } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    trigger('cellState', [
      state('correct', style({
        backgroundColor: 'black',
        color: 'white'
      })),
      state('wrong', style({
        backgroundColor: 'red',
        color: 'white'
      })),
      transition('default <=> correct', animate(300)),
      transition('wrong => correct', animate(600))
    ]),
    trigger('winAnimation', [
      transition('* => true', [
        animate('5s', keyframes([
          style({ transform: 'translateX({{x1}}%) translateY({{y1}}%)', offset: 0.2 }),
          style({ transform: 'translateX({{x2}}%) translateY({{y2}}%)', offset: 0.4 }),
          style({ transform: 'translateX({{x3}}%) translateY({{y3}}%)', offset: 0.6 }),
          style({ transform: 'translateX({{x4}}%) translateY({{y4}}%)', offset: 0.8 }),
          style({ transform: 'translateX(0) translateY(0)', offset: 1.0 }),
        ]))
      ])
    ])
  ]
})

export class AppComponent implements OnInit {
  crossword: { letter?: string, state: string }[][] = [];
  crosswordSize = 7; // 7x7 board
  sequence = 'SIGNALS';
  sequenceIndex = 0;
  sequenceCells: { row: number, column: number }[] = [];
  lastClickedCell: { row: number, column: number } | null = null;
  numberOfClickedCells = signal(0);
  randomFactor: Signal<number> = signal(0);
  isGameFinished = signal(false);


  ngOnInit(): void {
    this.initializeCrossword();
  }

  initializeCrossword(): void {
    if (!this.crossword.length) { // If board is not created yet
      this.createBoard();
    }

    this.fillBoard();

    this.sequenceIndex = 0;
    this.isGameFinished.set(false);
    this.lastClickedCell = null;
    this.numberOfClickedCells.set(0);
  }

  initializeCell(i: number, j: number): { letter?: string, state: string } {
    let cell = { letter: '', state: 'default' };
    if (i === j) {
      cell.letter = this.sequence[i];
    } else {
      cell.letter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    }
    return cell;
  }

  createBoard() {
    this.crossword = Array.from({ length: this.crosswordSize }, (x, i) =>
      Array.from({ length: this.crosswordSize }, (x, j) => this.initializeCell(i, j))
    );
  }
  
  fillBoard() {
    for (let i = 0; i < this.crosswordSize; i++) {
      for (let j = 0; j < this.crosswordSize; j++) {
        this.crossword[i][j] = this.initializeCell(i, j);
      }
    }
  }

  resetCrossword(): void {
    console.log("board reset");
    this.initializeCrossword();
  }

  isAdjacentCell(row: number, column: number): boolean {
    if (!this.lastClickedCell) {
      return true;
    }

    let rowDifference = Math.abs(this.lastClickedCell.row - row);
    let columnDifference = Math.abs(this.lastClickedCell.column - column);

    return rowDifference <= 1 && columnDifference <= 1; // true if the cell is adjacent of the last clicked cell
  }

  checkLetter(row: number, column: number): void {
    if (this.isGameFinished()) {
      return;
    }

    this.numberOfClickedCells.update(amount => amount + 1);

    if (this.isAdjacentCell(row, column) &&
      this.crossword[row][column].letter === this.sequence[this.sequenceIndex]) {
      this.sequenceIndex++;
      this.crossword[row][column].state = 'correct';
      this.lastClickedCell = { row, column };
      this.sequenceCells.push({ row, column });

      if (this.sequenceIndex === this.sequence.length) {
        this.isGameFinished.set(true);
      }
    } else {
      this.crossword[row][column].state = 'wrong';
    }
  }

  randomizeCellPosition() {
    let position: Record<string, number> = {};
    const maximumValue = 300;

    // const randomFactor = this.sequence.length * maximumValue / (this.numberOfClickedCells() || 1); // ensure there's no division by zero

    this.randomFactor = computed(() => this.sequence.length * maximumValue / (this.numberOfClickedCells() || 1))

    for (let i = 0; i < 8; i++) {
      let axis = i < 4 ? 'x' : 'y';
      let index = (i % 4) + 1;
      position[`${axis}${index}`] = (Math.random() * 2 - 1) * this.randomFactor(); // allow negative values
    }
    
    return {
      value: this.isGameFinished(),
      params: position,
    };
  }
}
