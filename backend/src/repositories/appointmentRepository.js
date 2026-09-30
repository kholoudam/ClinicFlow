export async function create(client, data) {
  const { rows } = await client.query(
    `INSERT INTO appointments(
       patient_id,
       appointment_date,
       status,
       reason,
       notes,
       created_by
     )
     VALUES($1,$2,$3,$4,$5,$6)
     RETURNING
       id,
       patient_id,
       appointment_date,
       status,
       reason,
       notes,
       created_by,
       created_at,
       updated_at`,
    [
      data.patientId,
      data.appointmentDate,
      data.status,
      data.reason,
      data.notes ?? null,
      data.createdBy
    ]
  );

  return rows[0];
}

export async function findConfirmedConflict(
  client,
  { patientId, appointmentDate, excludeId }
) {
  const { rows } = await client.query(
    `SELECT id,appointment_date
     FROM appointments
     WHERE patient_id=$1
       AND status='confirmed'
       AND appointment_date BETWEEN (
         $2::timestamptz - INTERVAL '30 minutes'
       ) AND (
         $2::timestamptz + INTERVAL '30 minutes'
       )
       AND ($3::uuid IS NULL OR id<>$3::uuid)
     LIMIT 1
     FOR UPDATE`,
    [patientId, appointmentDate, excludeId ?? null]
  );

  return rows[0] ?? null;
}

export async function findById(client, id) {
  const { rows } = await client.query(
    `SELECT
       id,
       patient_id,
       appointment_date,
       status,
       reason,
       notes,
       created_by,
       created_at,
       updated_at
     FROM appointments
     WHERE id=$1`,
    [id]
  );

  return rows[0] ?? null;
}

export async function updateStatus(client, id, status) {
  const { rows } = await client.query(
    `UPDATE appointments
     SET status=$1
     WHERE id=$2
     RETURNING
       id,
       patient_id,
       appointment_date,
       status,
       reason,
       notes,
       created_by,
       created_at,
       updated_at`,
    [status, id]
  );

  return rows[0] ?? null;
}

export async function list(client, { date, status }) {
  const params = [];
  const where = [];

  if (date) {
    params.push(date);
    where.push(
      `a.appointment_date >= $${params.length}::date
       AND a.appointment_date < ($${params.length}::date + INTERVAL '1 day')`
    );
  }

  if (status) {
    params.push(status);
    where.push(`a.status=$${params.length}`);
  }

  const sql = `
    SELECT
      a.id,
      a.patient_id,
      p.full_name AS patient_name,
      a.appointment_date,
      a.status,
      a.reason,
      a.notes,
      a.created_by,
      a.created_at
    FROM appointments a
    JOIN patients p ON p.id=a.patient_id
    WHERE p.deleted_at IS NULL
    ${where.length ? 'AND ' + where.join(' AND ') : ''}
    ORDER BY a.appointment_date ASC
  `;

  const { rows } = await client.query(sql, params);

  return rows;
}

export async function listByPatient(client, patientId) {
  const { rows } = await client.query(
    `SELECT
       id,
       patient_id,
       appointment_date,
       status,
       reason,
       notes,
       created_by,
       created_at
     FROM appointments
     WHERE patient_id=$1
     ORDER BY appointment_date DESC`,
    [patientId]
  );

  return rows;
}