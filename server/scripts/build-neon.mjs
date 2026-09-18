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
const emailFrom = process.env.EMAIL_FROM || 'DevVegis <vaibhavghoshi0@gmail.com>';
const emailHost = process.env.EMAIL_HOST || 'smtp.gmail.com';
const emailPort = process.env.EMAIL_PORT || '465';
const emailUser = process.env.EMAIL_USER || '';
const emailPass = process.env.EMAIL_PASS || '';
const awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID || '';
const awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || '';
const awsEndpointUrlS3 = process.env.AWS_ENDPOINT_URL_S3 || '';
const awsRegion = process.env.AWS_REGION || 'us-east-2';
const awsBucketName = process.env.AWS_BUCKET_NAME || 'uploads';
const turnstileSecretKey = process.env.TURNSTILE_SECRET_KEY || '0x4AAAAAAE8RCUNEXvz4suaK2mFj6g4TYW0';

if (!fs.existsSync(dist)) {
  fs.mkdirSync(dist, { recursive: true });
}

console.log('📦 Bundling Neon Function with esbuild...');
const bannerStr = `import{createRequire as ___cr}from'module';const require=___cr(import.meta.url);const __filename=require('url').fileURLToPath(import.meta.url);const __dirname=require('path').dirname(__filename);try{const ___fs=require('fs');const ___p=require('path');const t='/tmp/prisma-engines';if(!___fs.existsSync(t))___fs.mkdirSync(t,{recursive:true});for(const d of[__dirname,process.cwd(),'/app','/']){if(___fs.existsSync(d)){for(const f of ___fs.readdirSync(d)){if(f.endsWith('.so.node')){const dst=___p.join(t,f);if(!___fs.existsSync(dst))___fs.copyFileSync(___p.join(d,f),dst);}}}}}catch(e){}`;

execSync(
  `npx esbuild src/function.ts --bundle --platform=node --target=node24 --format=esm ` +
  `--banner:js="${bannerStr}" ` +
  `--define:process.env.NODE_ENV='"production"' ` +
  `--define:process.env.TURNSTILE_SECRET_KEY='${JSON.stringify(turnstileSecretKey)}' ` +
  `--define:process.env.RESEND_API_KEY='${JSON.stringify(resendApiKey)}' ` +
  `--define:process.env.EMAIL_FROM='${JSON.stringify(emailFrom)}' ` +
  `--define:process.env.EMAIL_HOST='${JSON.stringify(emailHost)}' ` +
  `--define:process.env.EMAIL_PORT='${JSON.stringify(emailPort)}' ` +
  `--define:process.env.EMAIL_USER='${JSON.stringify(emailUser)}' ` +
  `--define:process.env.EMAIL_PASS='${JSON.stringify(emailPass)}' ` +
  `--define:process.env.AWS_ACCESS_KEY_ID='${JSON.stringify(awsAccessKeyId)}' ` +
  `--define:process.env.AWS_SECRET_ACCESS_KEY='${JSON.stringify(awsSecretAccessKey)}' ` +
  `--define:process.env.AWS_ENDPOINT_URL_S3='${JSON.stringify(awsEndpointUrlS3)}' ` +
  `--define:process.env.AWS_REGION='${JSON.stringify(awsRegion)}' ` +
  `--define:process.env.AWS_BUCKET_NAME='${JSON.stringify(awsBucketName)}' ` +
  `--outfile=dist-function/index.mjs`,
  { stdio: 'inherit', cwd: root }
);

console.log('📋 Copying Prisma engines and schema...');
const prismaClientDirs = [
  path.join(root, '../node_modules/.prisma/client'),
  path.join(root, 'node_modules/.prisma/client'),
];

let enginesFound = 0;
for (const dir of prismaClientDirs) {
  if (fs.existsSync(dir)) {
    const armEngine = path.join(dir, 'libquery_engine-linux-arm64-openssl-3.0.x.so.node');
    if (fs.existsSync(armEngine)) {
      fs.copyFileSync(armEngine, path.join(dist, 'libquery_engine-linux-arm64-openssl-3.0.x.so.node'));
      console.log('✓ Copied engine: libquery_engine-linux-arm64-openssl-3.0.x.so.node');
      enginesFound++;
      break;
    }
  }
}

if (enginesFound === 0) {
  console.warn('⚠️ Warning: No Prisma query engine .so.node files found!');
}

const schemaSrc = path.join(root, 'prisma/schema.prisma');
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
