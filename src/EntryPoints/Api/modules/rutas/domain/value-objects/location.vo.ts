export class Location {
  constructor(readonly latitud: number, readonly longitud: number) {
    if (latitud < -90 || latitud > 90) {
      throw new Error('Latitud inválida.');
    }
    if (longitud < -180 || longitud > 180) {
      throw new Error('Longitud inválida.');
    }
  }

  toString(): string {
    return `${this.latitud},${this.longitud}`;
  }
}
