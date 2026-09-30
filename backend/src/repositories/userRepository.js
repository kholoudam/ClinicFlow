export async function findByEmail(client, email) {
  const { rows } = await client.query(
    'SELECT id,email,password_hash,role FROM users WHERE email=$1',
    [email]
  );

  return rows[0] ?? null;
}

export async function findPublicById(client, id) {
  const { rows } = await client.query(
    'SELECT id,email,role,created_at FROM users WHERE id=$1',
    [id]
  );

  return rows[0] ?? null;
}