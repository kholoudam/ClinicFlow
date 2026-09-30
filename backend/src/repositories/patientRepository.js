export async function create(client, data) {
  const { rows } = await client.query(
    `INSERT INTO patients(
       full_name,
       cin,
       phone,
       birth_date,
       address
     )
     VALUES($1,$2,$3,$4,$5)
     RETURNING
       id,
       full_name,
       cin,
       phone,
       birth_date,
       address,
       created_at,
       updated_at,
       deleted_at`,
    [
      data.fullName,
      data.cin,
      data.phone,
      data.birthDate,
      data.address ?? null
    ]
  );

  return rows[0];
}

export async function list(client, { search, page, limit }) {
  const offset = (page - 1) * limit;
  const like = search ? `%${search}%` : '%';
  const where = `
    deleted_at IS NULL
    AND (full_name ILIKE $1 OR cin ILIKE $1)
  `;

  const [{ rows }, count] = await Promise.all([
    client.query(
      `SELECT
         id,
         full_name,
         cin,
         phone,
         birth_date,
         address,
         created_at
       FROM patients
       WHERE ${where}
       ORDER BY full_name ASC
       LIMIT $2
       OFFSET $3`,
      [like, limit, offset]
    ),

    client.query(
      `SELECT COUNT(*)::int AS total
       FROM patients
       WHERE ${where}`,
      [like]
    )
  ]);

  return {
    rows,
    total: count.rows[0].total
  };
}

export async function findById(client, id) {
  const { rows } = await client.query(
    `SELECT
       id,
       full_name,
       cin,
       phone,
       birth_date,
       address,
       created_at,
       updated_at,
       deleted_at
     FROM patients
     WHERE id = $1
       AND deleted_at IS NULL`,
    [id]
  );

  return rows[0] ?? null;
}

export async function update(client, id, data) {
  const { rows } = await client.query(
    `UPDATE patients
     SET
       full_name = $1,
       cin = $2,
       phone = $3,
       birth_date = $4,
       address = $5
     WHERE id = $6
       AND deleted_at IS NULL
     RETURNING
       id,
       full_name,
       cin,
       phone,
       birth_date,
       address,
       created_at,
       updated_at,
       deleted_at`,
    [
      data.fullName,
      data.cin,
      data.phone,
      data.birthDate,
      data.address ?? null,
      id
    ]
  );

  return rows[0] ?? null;
}

export async function softDelete(client, id) {
  const { rowCount } = await client.query(
    'UPDATE patients SET deleted_at=NOW() WHERE id=$1 AND deleted_at IS NULL',
    [id]
  );

  return rowCount > 0;
}

export async function existsActive(client, id) {
  const { rowCount } = await client.query(
    'SELECT 1 FROM patients WHERE id=$1 AND deleted_at IS NULL',
    [id]
  );

  return rowCount > 0;
}