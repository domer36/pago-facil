export interface Prospect {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProspectInput {
  fullName: string;
  phone: string;
  email: string;
}

export type UpdateProspectInput = Partial<CreateProspectInput>;

export class ProspectValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ProspectValidationError';
  }
}

export function parseCreateProspect(input: unknown): CreateProspectInput {
  const body = asRecord(input);
  return {
    fullName: parseRequiredText(body.fullName, 'El nombre'),
    phone: parseRequiredText(body.phone, 'El teléfono', 50),
    email: parseEmail(body.email),
  };
}

export function parseUpdateProspect(input: unknown): UpdateProspectInput {
  const body = asRecord(input);
  const allowedFields = new Set(['fullName', 'phone', 'email']);
  const invalidField = Object.keys(body).find(
    (field) => !allowedFields.has(field),
  );
  if (invalidField) {
    throw new ProspectValidationError(
      `El campo "${invalidField}" no se puede actualizar.`,
    );
  }

  const update: UpdateProspectInput = {};
  if ('fullName' in body) {
    update.fullName = parseRequiredText(body.fullName, 'El nombre');
  }
  if ('phone' in body) {
    update.phone = parseRequiredText(body.phone, 'El teléfono', 50);
  }
  if ('email' in body) {
    update.email = parseEmail(body.email);
  }
  if (Object.keys(update).length === 0) {
    throw new ProspectValidationError(
      'Indica al menos un dato válido para actualizar.',
    );
  }
  return update;
}

function asRecord(input: unknown): Record<string, unknown> {
  if (input === null || typeof input !== 'object' || Array.isArray(input)) {
    throw new ProspectValidationError(
      'Los datos del prospecto no son válidos.',
    );
  }
  return input as Record<string, unknown>;
}

function parseRequiredText(
  input: unknown,
  fieldName: string,
  maxLength = 255,
): string {
  if (typeof input !== 'string' || input.trim().length === 0) {
    throw new ProspectValidationError(`${fieldName} es obligatorio.`);
  }
  const value = input.trim();
  if (value.length > maxLength) {
    throw new ProspectValidationError(
      `${fieldName} no puede exceder ${maxLength} caracteres.`,
    );
  }
  return value;
}

function parseEmail(input: unknown): string {
  const email = parseRequiredText(input, 'El correo electrónico').toLowerCase();
  if (email.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ProspectValidationError(
      'El correo electrónico debe tener un formato válido.',
    );
  }
  return email;
}
