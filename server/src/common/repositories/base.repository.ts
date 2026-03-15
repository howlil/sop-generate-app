export interface IBaseRepository<T, CreateDto, UpdateDto> {
  findAll(skip?: number, take?: number): Promise<T[]>;
  findById(id: string): Promise<T | null>;
  create(data: CreateDto): Promise<T>;
  update(id: string, data: UpdateDto): Promise<T>;
  delete(id: string): Promise<void>;
  count(): Promise<number>;
}
