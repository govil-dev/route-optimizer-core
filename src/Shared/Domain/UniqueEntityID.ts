
import { v4 as uuidv4 } from "uuid";

export class UniqueEntityID {
  private readonly value: string;

  constructor(id?: string) {
    this.value = id || uuidv4();
  }

  public toString(): string {
    return this.value;
  }

  public equals(id?: UniqueEntityID): boolean {
    if (id === null || id === undefined) {
      return false;
    }
    if (!(id instanceof UniqueEntityID)) {
      return false;
    }
    return id.value === this.value;
  }
}
