import fs from "node:fs/promises";
import path from "node:path";
import pg from "pg";

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const connectionString = process.env.DATABASE_URL;

if (!supabaseUrl || !serviceRoleKey || !connectionString) {
  throw new Error("SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and DATABASE_URL are required");
}

const pool = new pg.Pool({ connectionString });
const uploadDir = path.join(process.cwd(), "public", "uploads", "post-images");

function storageObjectName(coverImage) {
  if (!coverImage) return null;
  const marker = "/storage/v1/object/public/post-images/";
  const index = coverImage.indexOf(marker);
  if (index === -1) return null;
  return decodeURIComponent(coverImage.slice(index + marker.length));
}

function extensionFor(name, contentType) {
  const ext = path.extname(name);
  if (ext) return ext;
  if (contentType?.includes("jpeg")) return ".jpg";
  if (contentType?.includes("webp")) return ".webp";
  if (contentType?.includes("svg")) return ".svg";
  return ".png";
}

async function fetchRemotePosts() {
  const response = await fetch(
    `${supabaseUrl}/rest/v1/posts?select=slug,title,cover_image&order=slug.asc`,
    {
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to read remote posts: ${response.status} ${await response.text()}`);
  }

  return response.json();
}

async function downloadObject(objectName, targetName) {
  const url = `${supabaseUrl}/storage/v1/object/public/post-images/${encodeURIComponent(objectName)}`;
  const response = await fetch(url, {
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to download ${objectName}: ${response.status}`);
  }

  const contentType = response.headers.get("content-type") ?? "";
  const extension = extensionFor(objectName, contentType);
  const filename = `${targetName}${extension}`;
  const filePath = path.join(uploadDir, filename);
  const bytes = Buffer.from(await response.arrayBuffer());
  await fs.writeFile(filePath, bytes);

  return `/uploads/post-images/${filename}`;
}

await fs.mkdir(uploadDir, { recursive: true });

const remotePosts = await fetchRemotePosts();
const client = await pool.connect();
let downloaded = 0;
let updated = 0;

try {
  await client.query("BEGIN");

  for (const post of remotePosts) {
    const objectName = storageObjectName(post.cover_image);
    if (!objectName) continue;

    const localPath = await downloadObject(objectName, post.slug);
    downloaded++;

    const result = await client.query(
      `
      UPDATE posts
      SET cover_image = $1
      WHERE slug = $2
      RETURNING id
      `,
      [localPath, post.slug],
    );

    if (result.rowCount === 0) {
      await client.query(
        `
        INSERT INTO posts (slug, title, content, excerpt, published, author_id, cover_image, reading_time, published_at)
        SELECT $1, $2, '', NULL, true, p.id, $3, 1, now()
        FROM profiles p
        WHERE p.role = 'admin'
        ORDER BY p.created_at ASC
        LIMIT 1
        `,
        [post.slug, post.title, localPath],
      );
    }

    updated++;
  }

  await client.query("COMMIT");
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally {
  client.release();
  await pool.end();
}

console.log(`Downloaded ${downloaded} images`);
console.log(`Updated ${updated} posts`);
