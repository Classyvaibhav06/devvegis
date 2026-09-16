import "dotenv/config";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

async function main() {
  const endpoint = process.env.AWS_ENDPOINT_URL_S3;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const region = process.env.AWS_REGION || "us-east-2";
  const bucket = process.env.AWS_BUCKET_NAME || "uploads";

  console.log("-----------------------------------------");
  console.log("Testing Neon Object Storage (S3)...");
  console.log(`Endpoint: ${endpoint || "(not set in .env)"}`);
  console.log(`Bucket:   ${bucket}`);
  console.log(`Region:   ${region}`);
  console.log("-----------------------------------------");

  if (!endpoint || !accessKeyId || !secretAccessKey) {
    console.error("❌ Missing S3 credentials in .env!");
    console.error("Please ensure AWS_ENDPOINT_URL_S3, AWS_ACCESS_KEY_ID, and AWS_SECRET_ACCESS_KEY are set.");
    process.exit(1);
  }

  const s3 = new S3Client({
    forcePathStyle: true, // Required for Neon S3
    region,
    endpoint,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  const key = `test/test-${Date.now()}.txt`;
  console.log(`Uploading test file to "${key}"...`);

  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: "Hello from DevVegis on Neon Object Storage!",
      ContentType: "text/plain",
    })
  );
  console.log("✅ Upload succeeded!");

  const url = await getSignedUrl(
    s3,
    new GetObjectCommand({ Bucket: bucket, Key: key }),
    { expiresIn: 3600 }
  );

  console.log(`[view presigned URL] ${url}`);
  console.log(`[view public URL]    ${endpoint.replace(/\/+$/, '')}/${bucket}/${key}`);
}

main().catch((err) => {
  console.error("❌ S3 Test Failed:", err);
  process.exit(1);
});
