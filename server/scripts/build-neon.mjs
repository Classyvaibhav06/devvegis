import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist-function');

dotenv.config({ path: path.join(root, '.env') });
const resendApiKey = process.env.RESEND_API_KEY || '';
const emailFrom = process.env.EMAIL_FROM || 'DevVegis <onboarding@resend.dev>';

if (!fs.existsSync(dist)) {
  fs.mkdirSync(dist, { recursive: true });
}

console.log('📦 Bundling Neon Function with esbuild...');
execSync(
  `npx esbuild src/function.ts --bundle --platform=node --target=node24 --format=esm ` +
  `--banner:js="import{createRequire as ___cr}from'module';import{fileURLToPath as ___f}from'url';import{dirname as ___d}from'path';const require=___cr(import.meta.url);const __filename=___f(import.meta.url);const __dirname=___d(__filename);" ` +
  `--define:process.env.RESEND_API_KEY='${JSON.stringify(resendApiKey)}' ` +
  `--define:process.env.EMAIL_FROM='${JSON.stringify(emailFrom)}' ` +
  `--outfile=dist-function/index.mjs`,
  { stdio: 'inherit', cwd: root }
);

console.log('📋 Copying Prisma engine and schema...');
const engineCandidates = [
  path.join(root, '../node_modules/.prisma/client/libquery_engine-linux-arm64-openssl-3.0.x.so.node'),
  path.join(root, 'node_modules/.prisma/client/libquery_engine-linux-arm64-openssl-3.0.x.so.node'),
];
const engineSrc = engineCandidates.find(p => fs.existsSync(p));
const schemaSrc = path.join(root, 'prisma/schema.prisma');

if (engineSrc) {
  fs.copyFileSync(engineSrc, path.join(dist, 'libquery_engine-linux-arm64-openssl-3.0.x.so.node'));
  console.log(`✓ Copied engine from ${engineSrc}`);
} else {
  console.warn('⚠️ Warning: libquery_engine-linux-arm64-openssl-3.0.x.so.node not found!');
}

if (fs.existsSync(schemaSrc)) {
  fs.copyFileSync(schemaSrc, path.join(dist, 'schema.prisma'));
  console.log('✓ Copied schema.prisma');
}

const envSrc = path.join(root, '.env');
if (fs.existsSync(envSrc)) {
  fs.copyFileSync(envSrc, path.join(dist, '.env'));
  console.log('✓ Copied .env');
}

console.log('✅ Neon Function bundle ready in server/dist-function');
