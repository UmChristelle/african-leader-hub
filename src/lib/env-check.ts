const REQUIRED = [
  "DATABASE_URL",
  "JWT_SECRET",
  "JWT_REFRESH_SECRET",
  "CSRF_SECRET",
] as const;

const RECOMMENDED = [
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "APP_URL",
] as const;

let checked = false;

export function checkEnv() {
  if (checked) return;
  checked = true;
  const missing = REQUIRED.filter((k) => !process.env[k]);
  const missingRec = RECOMMENDED.filter((k) => !process.env[k]);
  if (missing.length) {
    console.error("[env] Missing required variables: %s", missing.join(", "));
  }
  if (missingRec.length) {
    console.warn("[env] Missing recommended variables: %s", missingRec.join(", "));
  }
  if (!missing.length && !missingRec.length) {
    console.log("[env] All required and recommended variables are set");
  }
}