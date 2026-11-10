import type {
  CreateProspectInput,
  Prospect,
  UpdateProspectInput,
} from '../domain/prospect.js';

export const PROSPECT_REPOSITORY = Symbol('PROSPECT_REPOSITORY');

export interface ProspectRepository {
  findActive(search?: string): Promise<Prospect[]>;
  findActiveById(id: string): Promise<Prospect | null>;
  create(input: CreateProspectInput): Promise<Prospect>;
  update(id: string, input: UpdateProspectInput): Promise<Prospect | null>;
  deactivate(id: string): Promise<boolean>;
}
