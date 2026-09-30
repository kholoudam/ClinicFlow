import bcrypt from 'bcrypt';
import { pool } from '../../src/config/db.js';

const passwords = {
  admin: 'Admin123!',
  staff1: 'Staff123!',
  staff2: 'Staff456!'
};

const client = await pool.connect();

try {
  await client.query('BEGIN');

  const hashes = {};

  for (const [k, v] of Object.entries(passwords)) {
    hashes[k] = await bcrypt.hash(v, 11);
  }

  await client.query(
    `INSERT INTO users(email,password_hash,role)
     VALUES
       ('admin@clinicflow.local',$1,'admin'),
       ('staff1@clinicflow.local',$2,'staff'),
       ('staff2@clinicflow.local',$3,'staff')
     ON CONFLICT(email)
     DO UPDATE SET
       password_hash=EXCLUDED.password_hash,
       role=EXCLUDED.role`,
    [hashes.admin, hashes.staff1, hashes.staff2]
  );

  const patients = [
    ['Sara El Amrani', 'CIN001', '0611111111', '1990-02-10', 'Casablanca'],
    ['Youssef Alaoui', 'CIN002', '0622222222', '1985-07-18', 'Rabat'],
    ['Nadia Bennani', 'CIN003', '0633333333', '1993-11-02', 'Casablanca'],
    ['Omar Idrissi', 'CIN004', '0644444444', '1978-04-25', 'Mohammedia'],
    ['Salma Tazi', 'CIN005', '0655555555', '2000-09-14', 'Casablanca']
  ];

  for (const p of patients) {
    await client.query(
      `INSERT INTO patients(full_name,cin,phone,birth_date,address)
       VALUES($1,$2,$3,$4,$5)
       ON CONFLICT(cin)
       DO UPDATE SET
         full_name=EXCLUDED.full_name,
         phone=EXCLUDED.phone,
         birth_date=EXCLUDED.birth_date,
         address=EXCLUDED.address,
         deleted_at=NULL`,
      p
    );
  }

  const { rows: users } = await client.query(
    `SELECT id,email
     FROM users
     WHERE email IN (
       'admin@clinicflow.local',
       'staff1@clinicflow.local',
       'staff2@clinicflow.local'
     )`
  );

  const { rows: ps } = await client.query(
    `SELECT id,cin
     FROM patients
     WHERE cin LIKE 'CIN%'`
  );

  const u = Object.fromEntries(users.map(x => [x.email, x.id]));
  const p = Object.fromEntries(ps.map(x => [x.cin, x.id]));

  const base = new Date();
  base.setHours(9, 0, 0, 0);

  const data = [
    ['CIN001', 0, 'pending', 'Consultation générale'],
    ['CIN001', 1, 'confirmed', 'Suivi'],
    ['CIN002', 2, 'cancelled', 'Contrôle'],
    ['CIN002', 3, 'confirmed', 'Consultation'],
    ['CIN003', 4, 'confirmed', 'Bilan'],
    ['CIN003', 5, 'pending', 'Contrôle'],
    ['CIN004', 6, 'cancelled', 'Douleur'],
    ['CIN004', 7, 'confirmed', 'Suivi'],
    ['CIN005', 8, 'pending', 'Consultation'],
    ['CIN005', 9, 'confirmed', 'Bilan']
  ];

  for (const [cin, d, status, reason] of data) {
    const dt = new Date(base.getTime() + d * 86400000);

    await client.query(
      `INSERT INTO appointments(
         patient_id,
         appointment_date,
         status,
         reason,
         created_by
       )
       SELECT $1,$2,$3,$4,$5
       WHERE NOT EXISTS(
         SELECT 1
         FROM appointments
         WHERE patient_id=$1
           AND appointment_date=$2
       )`,
      [
        p[cin],
        dt,
        status,
        reason,
        u['staff1@clinicflow.local']
      ]
    );
  }

  await client.query('COMMIT');

  console.log(
    'Seed complete. admin@clinicflow.local / Admin123! | staff1@clinicflow.local / Staff123! | staff2@clinicflow.local / Staff456!'
  );
} catch (e) {
  await client.query('ROLLBACK');
  throw e;
} finally {
  client.release();
  await pool.end();
}