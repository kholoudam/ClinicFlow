import { pool } from '../config/db.js';
import * as repo from '../repositories/appointmentRepository.js';
import * as patients from '../repositories/patientRepository.js';
import * as audit from '../repositories/auditRepository.js';
import { conflict, notFound } from '../utils/errors.js';

async function withPatientLock(client, patientId, fn) {
  await client.query(
    'SELECT pg_advisory_xact_lock(hashtextextended($1,0))',
    [patientId]
  );

  return fn();
}

export async function create(data, userId) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    if (!await patients.existsActive(client, data.patientId)) {
      throw notFound('Patient not found');
    }

    const appointment = await withPatientLock(
      client,
      data.patientId,
      async () => {
        if (data.status === 'confirmed') {
          const c = await repo.findConfirmedConflict(client, {
            patientId: data.patientId,
            appointmentDate: data.appointmentDate
          });

          if (c) {
            throw conflict(
              'Patient already has a confirmed appointment within 30 minutes',
              {
                conflictingAppointmentId: c.id,
                appointmentDate: c.appointment_date
              }
            );
          }
        }

        return repo.create(client, {
          ...data,
          createdBy: userId
        });
      }
    );

    await audit.create(client, {
      userId,
      action: 'CREATE',
      entityType: 'appointment',
      entityId: appointment.id
    });

    await client.query('COMMIT');

    return appointment;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

export async function list(filters) {
  return repo.list(pool, filters);
}

export async function listByPatient(patientId) {
  if (!await patients.existsActive(pool, patientId)) {
    throw notFound('Patient not found');
  }

  return repo.listByPatient(pool, patientId);
}

export async function updateStatus(id, status, userId) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const current = await repo.findById(client, id);

    if (!current) {
      throw notFound('Appointment not found');
    }

    const updated = await withPatientLock(
      client,
      current.patient_id,
      async () => {
        if (status === 'confirmed') {
          const c = await repo.findConfirmedConflict(client, {
            patientId: current.patient_id,
            appointmentDate: current.appointment_date,
            excludeId: id
          });

          if (c) {
            throw conflict(
              'Patient already has a confirmed appointment within 30 minutes',
              {
                conflictingAppointmentId: c.id,
                appointmentDate: c.appointment_date
              }
            );
          }
        }

        return repo.updateStatus(client, id, status);
      }
    );

    await audit.create(client, {
      userId,
      action: 'STATUS_UPDATE',
      entityType: 'appointment',
      entityId: id,
      metadata: {
        from: current.status,
        to: status
      }
    });

    await client.query('COMMIT');

    return updated;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}