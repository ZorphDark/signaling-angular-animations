import { animate, keyframes, state, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, OnInit, Signal, computed, signal } from '@angular/core';

@Component({
  selector: 'app-sopa-de-letras',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sopa-de-letras.component.html',
  styleUrls: ['./sopa-de-letras.component.scss'],
  animations: [
    trigger('estadoDeCasilla', [
      state('correcto', style({
        backgroundColor: 'var(--color-viejo-oscuro)',
        color: 'var(--color-casilla)'
      })),
      state('incorrecto', style({
        backgroundColor: 'var(--color-casilla-incorrecta)',
        color: 'var(--color-casilla)'
      })),
      transition('inicial <=> correcto', animate(300)),
      transition('inicial <=> incorrecto', animate(300)),
      transition('incorrecto => correcto', animate(600))
    ]),
    trigger('animacionFinal', [
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

export class SopaDeLetrasComponent implements OnInit {
  sopaDeLetras: { letra?: string, estado: string }[][] = [];
  tamañoDelTablero = 7; // 7x7 board
  secuenciaDeLetras = 'SEÑALES';
  indiceDeSecuenciaDeLetras = 0;
  secuenciaDeCasillas: { fila: number, columna: number }[] = [];
  ultimaCasillaSeleccionada: { fila: number, columna: number } | null = null;
  numeroDeCasillasSeleccionadas = signal(0);
  factorAleatorio: Signal<number> = signal(0);
  esFinalDelJuego = signal(false);

  ngOnInit(): void {
    this.iniciarTablero();
  }

  iniciarTablero(): void {
    if (!this.sopaDeLetras.length) { // si el tablero aún no ha sido creado
      this.crearTablero();
    }

    this.rellenarTablero();

    this.indiceDeSecuenciaDeLetras = 0;
    this.esFinalDelJuego.set(false);
    this.ultimaCasillaSeleccionada = null;
    this.numeroDeCasillasSeleccionadas.set(0);
  }

  inicializarCasilla(i: number, j: number): { letra?: string, estado: string } {
    let casilla = { letra: '', estado: 'inicial' };
    if (i === j) {
      casilla.letra = this.secuenciaDeLetras[i];
    } else {
      casilla.letra = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    }
    return casilla;
  }

  crearTablero(): void {
    this.sopaDeLetras = Array.from({ length: this.tamañoDelTablero }, (x, i) =>
      Array.from({ length: this.tamañoDelTablero }, (x, j) => this.inicializarCasilla(i, j))
    );
  }
  
  rellenarTablero(): void {
    for (let i = 0; i < this.tamañoDelTablero; i++) {
      for (let j = 0; j < this.tamañoDelTablero; j++) {
        this.sopaDeLetras[i][j] = this.inicializarCasilla(i, j);
      }
    }
  }

  esCasillaAdyacente(fila: number, columna: number): boolean {
    if (!this.ultimaCasillaSeleccionada) {
      return true;
    }

    let diferenciaDeFila = Math.abs(this.ultimaCasillaSeleccionada.fila - fila);
    let diferenciaDeColumna = Math.abs(this.ultimaCasillaSeleccionada.columna - columna);

    return diferenciaDeFila <= 1 && diferenciaDeColumna <= 1; // retorna verdadero si la celda es adyacente a la ultima seleccionada
  }

  comprobarLetra(fila: number, columna: number): void {
    if (this.esFinalDelJuego() || this.sopaDeLetras[fila][columna].estado === "correcto") {
      return;
    }

    this.numeroDeCasillasSeleccionadas.update(total => total + 1);

    if (this.esCasillaAdyacente(fila, columna) &&
      this.sopaDeLetras[fila][columna].letra === this.secuenciaDeLetras[this.indiceDeSecuenciaDeLetras]) {
      this.indiceDeSecuenciaDeLetras++;
      this.sopaDeLetras[fila][columna].estado = 'correcto';
      this.ultimaCasillaSeleccionada = { fila: fila, columna: columna };
      this.secuenciaDeCasillas.push({ fila: fila, columna: columna });

      if (this.indiceDeSecuenciaDeLetras === this.secuenciaDeLetras.length) {
        this.esFinalDelJuego.set(true);
      }
    } else {
      this.sopaDeLetras[fila][columna].estado = 'incorrecto';
    }
  }

  posicionAleatoriaDeCasilla() {
    let posicion: Record<string, number> = {};
    const valorMaximo = 300;

    this.factorAleatorio = computed(() => this.secuenciaDeLetras.length * valorMaximo / (this.numeroDeCasillasSeleccionadas() || 1)) // se comprueba de que no hay division entre cero

    for (let i = 0; i < 8; i++) {
      let eje = i < 4 ? 'x' : 'y';
      let indice = (i % 4) + 1;
      posicion[`${eje}${indice}`] = (Math.random() * 2 - 1) * this.factorAleatorio(); // permitir valores negativos
    }
    
    return {
      value: this.esFinalDelJuego(),
      params: posicion,
    };
  }
}
