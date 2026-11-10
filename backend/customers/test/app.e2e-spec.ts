import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { Pool } from 'pg';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';
import { PROSPECT_REPOSITORY } from './../src/features/customers/application/prospect.repository.js';
import type { ProspectRepository } from './../src/features/customers/application/prospect.repository.js';
import type {
  CreateProspectInput,
  Prospect,
  UpdateProspectInput,
} from './../src/features/customers/domain/prospect.js';

describe('Customers API (e2e)', () => {
  let app: INestApplication<App>;
  let repository: InMemoryProspectRepository;

  beforeEach(async () => {
    repository = new InMemoryProspectRepository();
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(Pool)
      .useValue({ query: vi.fn(), end: async () => undefined })
      .overrideProvider(PROSPECT_REPOSITORY)
      .useValue(repository)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('creates prospects and rejects missing required fields', async () => {
    await request(app.getHttpServer())
      .post('/customers')
      .send({ fullName: 'Ana Pérez', phone: '5551234567' })
      .expect(400)
      .expect(({ body }) =>
        expect(body.message).toBe('El correo electrónico es obligatorio.'),
      );

    const response = await request(app.getHttpServer())
      .post('/customers')
      .send({
        fullName: ' Ana Pérez ',
        phone: ' 5551234567 ',
        email: 'ANA@EXAMPLE.COM',
      })
      .expect(201);

    expect(response.body).toMatchObject({
      fullName: 'Ana Pérez',
      phone: '5551234567',
      email: 'ana@example.com',
      active: true,
    });
  });

  it('rejects duplicate email addresses with a Spanish error', async () => {
    await createProspect('ana@example.com');

    await request(app.getHttpServer())
      .post('/customers')
      .send({
        fullName: 'Otra persona',
        phone: '5551234568',
        email: 'ANA@example.com',
      })
      .expect(409)
      .expect(({ body }) =>
        expect(body.message).toBe(
          'Ya existe un prospecto registrado con ese correo electrónico.',
        ),
      );

    expect(repository.records).toHaveLength(1);
  });

  it('searches and updates active prospects, then deactivates them logically', async () => {
    const created = await createProspect('ana@example.com');

    await request(app.getHttpServer())
      .get(`/customers/${created.id}`)
      .expect(200)
      .expect(({ body }) => expect(body.id).toBe(created.id));

    await createProspect('luis@example.com', {
      fullName: 'Luis Gómez',
      phone: '5551000000',
    });
    const search = await request(app.getHttpServer())
      .get('/customers')
      .query({ search: 'ana' })
      .expect(200);
    expect(search.body).toHaveLength(1);
    expect(search.body[0].id).toBe(created.id);

    const updated = await request(app.getHttpServer())
      .patch(`/customers/${created.id}`)
      .send({ phone: '5552222222' })
      .expect(200);
    expect(updated.body.phone).toBe('5552222222');

    await request(app.getHttpServer())
      .delete(`/customers/${created.id}`)
      .expect(200)
      .expect(({ body }) =>
        expect(body.message).toBe('El prospecto se dio de baja correctamente.'),
      );

    const remaining = await request(app.getHttpServer())
      .get('/customers')
      .query({ search: 'ana' })
      .expect(200);
    expect(remaining.body).toEqual([]);
    await request(app.getHttpServer())
      .get(`/customers/${created.id}`)
      .expect(404);
    expect(repository.records).toHaveLength(2);
    expect(repository.records[0].active).toBe(false);
  });

  afterEach(async () => {
    await app.close();
  });

  async function createProspect(
    email: string,
    overrides: Partial<CreateProspectInput> = {},
  ): Promise<Prospect> {
    const response = await request(app.getHttpServer())
      .post('/customers')
      .send({
        fullName: 'Ana Pérez',
        phone: '5551234567',
        email,
        ...overrides,
      })
      .expect(201);
    return response.body;
  }
});

class InMemoryProspectRepository implements ProspectRepository {
  readonly records: Prospect[] = [];

  async findActive(search?: string): Promise<Prospect[]> {
    const value = search?.toLowerCase();
    return this.records.filter(
      (prospect) =>
        prospect.active &&
        (!value ||
          [prospect.fullName, prospect.phone, prospect.email].some((field) =>
            field.toLowerCase().includes(value),
          )),
    );
  }

  async findActiveById(id: string): Promise<Prospect | null> {
    return (
      this.records.find((prospect) => prospect.id === id && prospect.active) ??
      null
    );
  }

  async create(input: CreateProspectInput): Promise<Prospect> {
    if (this.records.some((prospect) => prospect.email === input.email)) {
      throw Object.assign(new Error(), {
        code: '23505',
        constraint: 'prospects_email_key',
      });
    }
    const now = new Date().toISOString();
    const prospect: Prospect = {
      id: `00000000-0000-4000-8000-${String(this.records.length + 1).padStart(12, '0')}`,
      ...input,
      active: true,
      createdAt: now,
      updatedAt: now,
    };
    this.records.push(prospect);
    return prospect;
  }

  async update(
    id: string,
    input: UpdateProspectInput,
  ): Promise<Prospect | null> {
    const prospect = await this.findActiveById(id);
    if (!prospect) {
      return null;
    }
    if (
      input.email &&
      this.records.some(
        (candidate) => candidate.id !== id && candidate.email === input.email,
      )
    ) {
      throw Object.assign(new Error(), {
        code: '23505',
        constraint: 'prospects_email_key',
      });
    }
    Object.assign(prospect, input, { updatedAt: new Date().toISOString() });
    return prospect;
  }

  async deactivate(id: string): Promise<boolean> {
    const prospect = await this.findActiveById(id);
    if (!prospect) {
      return false;
    }
    prospect.active = false;
    return true;
  }
}
