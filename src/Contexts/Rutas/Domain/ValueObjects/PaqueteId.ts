
import { UniqueEntityID } from "../../../../Shared/Domain/UniqueEntityID";

export class PaqueteId extends UniqueEntityID {
  private constructor(id?: string) {
    super(id);
  }

  public static create(id?: string): PaqueteId {
    return new PaqueteId(id);
  }
}
