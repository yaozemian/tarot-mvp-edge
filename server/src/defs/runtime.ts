// Typed runtime input keys for app code.
// VarKey and SecretKey are string literal union types, not values or config storage.
// Add a key here before using vars.get("KEY") or secret.get("KEY") in code.
// Values still come from .env.local in local dev and remote vars/secrets in deployed envs.

export type VarKey = "OPENAI_MODEL";

export type SecretKey = "OPENAI_API_KEY";
