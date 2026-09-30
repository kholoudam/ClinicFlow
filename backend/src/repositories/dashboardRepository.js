export async function stats(client) {
  const { rows } = await client.query(`
    SELECT
      (SELECT COUNT(*)::int
       FROM patients
       WHERE deleted_at IS NULL) AS total_patients,

      (SELECT COUNT(*)::int
       FROM appointments a
       JOIN patients p ON p.id = a.patient_id
       WHERE p.deleted_at IS NULL
         AND a.appointment_date >= CURRENT_DATE
         AND a.appointment_date < CURRENT_DATE + INTERVAL '1 day') AS appointments_today,

      (SELECT COUNT(*)::int
       FROM appointments a
       JOIN patients p ON p.id = a.patient_id
       WHERE p.deleted_at IS NULL
         AND a.status = 'pending') AS pending,

      (SELECT COUNT(*)::int
       FROM appointments a
       JOIN patients p ON p.id = a.patient_id
       WHERE p.deleted_at IS NULL
         AND a.status = 'confirmed') AS confirmed
  `);

  return rows[0];
}