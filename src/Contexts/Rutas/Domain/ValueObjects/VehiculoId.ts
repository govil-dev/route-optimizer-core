
import { UniqueEntityID } from "../../../../Shared/Domain/UniqueEntityID";

export class VehiculoId extends UniqueEntityID {
  private constructor(id?: string) {
    super(id);
  }

  public static create(id?: string): VehiculoId {
    return new VehiculoId(id);
  }
}
