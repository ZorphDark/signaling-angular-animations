import { animate, keyframes, state, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, OnInit, Signal, computed, signal } from '@angular/core';

@Component({
  selector: 'app-word-search',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './word-search.component.html',
  styleUrls: ['./word-search.component.scss'],
  animations: [
    trigger('cellState', [
      state('correct', style({
        backgroundColor: 'var(--dark-old-color)',
        color: 'var(--cell-background-color)'
      })),
      state('wrong', style({
        backgroundColor: 'var(--wrong-cell-color)',
        color: 'var(--cell-background-color)'
      })),
      transition('default <=> correct', animate(300)),
      transition('default <=> wrong', animate(300)),
      transition('wrong => correct', animate(600))
    ]),
    trigger('winAnimation', [
      transition('* => true', [
        animate('5s', keyframes([
          style({ transform: 'translateX({{x1}}px) translateY({{y1}}px)', offset: 0.2 }),
          style({ transform: 'translateX({{x2}}px) translateY({{y2}}px)', offset: 0.4 }),
          style({ transform: 'translateX({{x3}}px) translateY({{y3}}px)', offset: 0.6 }),
          style({ transform: 'translateX({{x4}}px) translateY({{y4}}px)', offset: 0.8 }),
          style({ transform: 'translateX(0) translateY(0)', offset: 1.0 }),
        ]))
      ])
    ])
  ]
})

export class WordSearchComponent implements OnInit {
  wordSearch: { letter?: string, state: string }[][] = [];
  wordSearchSize = 7; // 7x7 board
  sequence = 'SIGNALS';
  sequenceIndex = 0;
  sequenceCells: { row: number, column: number }[] = [];
  lastClickedCell: { row: number, column: number } | null = null;
  numberOfClickedCells = signal(0);
  randomFactor: Signal<number> = signal(0);
  isGameFinished = signal(false);

  ngOnInit(): void {
    this.initializeWordSearch();
  }

  initializeWordSearch(): void {
    if (!this.wordSearch.length) { // If board is not created yet
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

  createBoard(): void {
    this.wordSearch = Array.from({ length: this.wordSearchSize }, (x, i) =>
      Array.from({ length: this.wordSearchSize }, (x, j) => this.initializeCell(i, j))
    );
  }
  
  fillBoard(): void {
    for (let i = 0; i < this.wordSearchSize; i++) {
      for (let j = 0; j < this.wordSearchSize; j++) {
        this.wordSearch[i][j] = this.initializeCell(i, j);
      }
    }
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
    if (this.isGameFinished() || this.wordSearch[row][column].state === "correct") {
      return;
    }

    this.numberOfClickedCells.update(amount => amount + 1);

    if (this.isAdjacentCell(row, column) &&
      this.wordSearch[row][column].letter === this.sequence[this.sequenceIndex]) {
      this.sequenceIndex++;
      this.wordSearch[row][column].state = 'correct';
      this.lastClickedCell = { row, column };
      this.sequenceCells.push({ row, column });

      if (this.sequenceIndex === this.sequence.length) {
        this.isGameFinished.set(true);
      }
    } else {
      this.wordSearch[row][column].state = 'wrong';
    }
  }

  randomizeCellPosition() {
    let position: Record<string, number> = {};
    const maximumValue = 300;

    this.randomFactor = computed(() => this.sequence.length * maximumValue / (this.numberOfClickedCells() || 1)) // ensure there's no division by zero

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
