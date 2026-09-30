export async function create(
  client,
  { userId, action, entityType, entityId, metadata = {} }
) {
  await client.query(
    'INSERT INTO audit_logs(user_id,action,entity_type,entity_id,metadata) VALUES($1,$2,$3,$4,$5)',
    [userId, action, entityType, entityId ?? null, metadata]
  );
}