export interface IUserRepository {
  findAll(skip?: number, take?: number): Promise<any[]>;
  findById(id: string): Promise<any | null>;
  findByIdWithPassword(id: string): Promise<any | null>;
  create(data: any): Promise<any>;
  update(id: string, data: any): Promise<any>;
  delete(id: string): Promise<void>;
  count(): Promise<number>;
  findByEmail(email: string): Promise<any | null>;
  findByEmailWithPassword(email: string): Promise<any | null>;
  findByNip(nip: string): Promise<any | null>;
  findActiveRoleInOpd(peran: string, opdId: string): Promise<any | null>;
  hasActiveMembership(userId: string): Promise<boolean>;
}
