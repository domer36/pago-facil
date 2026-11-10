import { Inject, Injectable } from '@nestjs/common';
import {
  parseCreateProspect,
  parseUpdateProspect,
  ProspectValidationError,
} from '../domain/prospect.js';
import type { Prospect } from '../domain/prospect.js';
import { PROSPECT_REPOSITORY } from './prospect.repository.js';
import type { ProspectRepository } from './prospect.repository.js';

export class ProspectNotFoundError extends Error {
  constructor() {
    super('No se encontró un prospecto activo con ese identificador.');
    this.name = 'ProspectNotFoundError';
  }
}

export class ProspectEmailConflictError extends Error {
  constructor() {
    super('Ya existe un prospecto registrado con ese correo electrónico.');
    this.name = 'ProspectEmailConflictError';
  }
}

@Injectable()
export class ProspectService {
  constructor(
    @Inject(PROSPECT_REPOSITORY)
    private readonly prospectRepository: ProspectRepository,
  ) {}

  findActive(search?: string): Promise<Prospect[]> {
    return this.prospectRepository.findActive(search?.trim());
  }

  async findActiveById(id: string): Promise<Prospect> {
    const prospect = await this.prospectRepository.findActiveById(
      validateId(id),
    );
    if (!prospect) {
      throw new ProspectNotFoundError();
    }
    return prospect;
  }

  async create(input: unknown): Promise<Prospect> {
    const prospect = parseCreateProspect(input);
    return this.withEmailConflictMapping(() =>
      this.prospectRepository.create(prospect),
    );
  }

  async update(id: string, input: unknown): Promise<Prospect> {
    const prospect = await this.withEmailConflictMapping(() =>
      this.prospectRepository.update(
        validateId(id),
        parseUpdateProspect(input),
      ),
    );
    if (!prospect) {
      throw new ProspectNotFoundError();
    }
    return prospect;
  }

  async deactivate(id: string): Promise<void> {
    const deactivated = await this.prospectRepository.deactivate(
      validateId(id),
    );
    if (!deactivated) {
      throw new ProspectNotFoundError();
    }
  }

  private async withEmailConflictMapping<T>(
    operation: () => Promise<T>,
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (isUniqueConstraintViolation(error)) {
        throw new ProspectEmailConflictError();
      }
      throw error;
    }
  }
}

function validateId(id: string): string {
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  ) {
    throw new ProspectValidationError(
      'El identificador del prospecto no es válido.',
    );
  }
  return id;
}

function isUniqueConstraintViolation(error: unknown): boolean {
  return (
    error !== null &&
    typeof error === 'object' &&
    'code' in error &&
    error.code === '23505' &&
    'constraint' in error &&
    error.constraint === 'prospects_email_key'
  );
}
