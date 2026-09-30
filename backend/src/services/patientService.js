import { pool } from '../config/db.js';
import * as repo from '../repositories/patientRepository.js';
import * as audit from '../repositories/auditRepository.js';
import { notFound } from '../utils/errors.js';

export const create = (data, userId) =>
  repo.create(pool, data).then(async p => {
    await audit.create(pool, {
      userId,
      action: 'CREATE',
      entityType: 'patient',
      entityId: p.id
    });

    return p;
  });

export async function list(params) {
  const result = await repo.list(pool, params);

  return {
    ...result,
    page: params.page,
    limit: params.limit,
    totalPages: Math.ceil(result.total / params.limit)
  };
}

export async function get(id) {
  const p = await repo.findById(pool, id);

  if (!p) {
    throw notFound('Patient not found');
  }

  return p;
}

export async function update(id, data, userId) {
  const p = await repo.update(pool, id, data);

  if (!p) {
    throw notFound('Patient not found');
  }

  await audit.create(pool, {
    userId,
    action: 'UPDATE',
    entityType: 'patient',
    entityId: id
  });

  return p;
}

export async function remove(id, userId) {
  const ok = await repo.softDelete(pool, id);

  if (!ok) {
    throw notFound('Patient not found');
  }

  await audit.create(pool, {
    userId,
    action: 'SOFT_DELETE',
    entityType: 'patient',
    entityId: id
  });
}