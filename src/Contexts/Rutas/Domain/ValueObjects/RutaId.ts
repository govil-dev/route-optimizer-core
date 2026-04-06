
import { UniqueEntityID } from "../../../../Shared/Domain/UniqueEntityID";

export class RutaId extends UniqueEntityID {
  private constructor(id?: string) {
    super(id);
  }

  public static create(id?: string): RutaId {
    return new RutaId(id);
  }
}
