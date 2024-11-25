export class GeneralTagResponseDTO {
  id?: string;
  name?: string;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(partial: Partial<GeneralTagResponseDTO>) {
    Object.assign(this, partial);
  }
}
