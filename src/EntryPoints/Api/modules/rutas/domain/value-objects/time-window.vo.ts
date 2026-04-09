export class TimeWindow {
  constructor(readonly inicio: Date, readonly fin: Date) {
    if (inicio >= fin) {
      throw new Error('La ventana de tiempo es inválida.');
    }
  }
}
