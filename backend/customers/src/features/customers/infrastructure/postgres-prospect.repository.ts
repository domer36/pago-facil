import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import { Pool } from 'pg';
import type {
  CreateProspectInput,
  Prospect,
  UpdateProspectInput,
} from '../domain/prospect.js';

const PROSPECT_COLUMNS =
  'id, full_name, phone, email, active, created_at, updated_at';

interface ProspectRow {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  active: boolean;
  created_at: Date | string;
  updated_at: Date | string;
}

@Injectable()
export class PostgresProspectRepository implements OnModuleDestroy {
  constructor(@Inject(Pool) private readonly pool: Pool) {}

  async findActive(search?: string): Promise<Prospect[]> {
    const pattern = search ? `%${search}%` : null;
    const result = await this.pool.query<ProspectRow>(
      `SELECT ${PROSPECT_COLUMNS}
       FROM prospects
       WHERE active = TRUE
         AND ($1::text IS NULL OR full_name ILIKE $1 OR phone ILIKE $1 OR email ILIKE $1)
       ORDER BY full_name, id`,
      [pattern],
    );
    return result.rows.map(toProspect);
  }

  async findActiveById(id: string): Promise<Prospect | null> {
    const result = await this.pool.query<ProspectRow>(
      `SELECT ${PROSPECT_COLUMNS}
       FROM prospects
       WHERE id = $1 AND active = TRUE`,
      [id],
    );
    return result.rows[0] ? toProspect(result.rows[0]) : null;
  }

  async create(input: CreateProspectInput): Promise<Prospect> {
    const result = await this.pool.query<ProspectRow>(
      `INSERT INTO prospects (full_name, phone, email)
       VALUES ($1, $2, $3)
       RETURNING ${PROSPECT_COLUMNS}`,
      [input.fullName, input.phone, input.email],
    );
    return toProspect(result.rows[0]);
  }

  async update(
    id: string,
    input: UpdateProspectInput,
  ): Promise<Prospect | null> {
    const values: string[] = [id];
    const fields: string[] = [];
    if (input.fullName !== undefined) {
      values.push(input.fullName);
      fields.push(`full_name = $${values.length}`);
    }
    if (input.phone !== undefined) {
      values.push(input.phone);
      fields.push(`phone = $${values.length}`);
    }
    if (input.email !== undefined) {
      values.push(input.email);
      fields.push(`email = $${values.length}`);
    }

    const result = await this.pool.query<ProspectRow>(
      `UPDATE prospects
       SET ${fields.join(', ')}, updated_at = NOW()
       WHERE id = $1 AND active = TRUE
       RETURNING ${PROSPECT_COLUMNS}`,
      values,
    );
    return result.rows[0] ? toProspect(result.rows[0]) : null;
  }

  async deactivate(id: string): Promise<boolean> {
    const result = await this.pool.query(
      `UPDATE prospects
       SET active = FALSE, deleted_at = NOW(), updated_at = NOW()
       WHERE id = $1 AND active = TRUE`,
      [id],
    );
    return result.rowCount !== null && result.rowCount > 0;
  }

  onModuleDestroy(): Promise<void> {
    return this.pool.end();
  }
}

function toProspect(row: ProspectRow): Prospect {
  return {
    id: row.id,
    fullName: row.full_name,
    phone: row.phone,
    email: row.email,
    active: row.active,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
  };
}

function toIsoString(value: Date | string): string {
  return new Date(value).toISOString();
}
