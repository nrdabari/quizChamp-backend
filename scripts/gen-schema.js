/**
 * scripts/gen-schema.js
 * Generate a Markdown schema doc for all collections in a MongoDB database.
 *
 * How to run (uses .env for MONGO_URI you already saved):
 *   npm run schema:doc
 *   # or ad-hoc:
 *   node scripts/gen-schema.js --sample=500
 *
 * Optional CLI flags:
 *   --uri="mongodb://localhost:27017/olympiadDB"   // overrides .env MONGO_URI/MONGODB_URI
 *   --db=olympiadDB                                // only needed if URI has no db name
 *   --sample=800                                   // documents to sample per collection (default 1000)
 */

require("dotenv").config(); // loads .env (MONGO_URI / MONGODB_URI if present)

const fs = require("fs");
const path = require("path");
const {
  MongoClient,
  ObjectId,
  Long,
  Int32,
  Double,
  Decimal128,
} = require("mongodb");
let EJSON;
try {
  // pretty-print ObjectId/Date/etc. as Extended JSON
  EJSON = require("bson").EJSON;
} catch {
  EJSON = { stringify: (v, _opts) => JSON.stringify(v) };
}

// ---------- CLI args ----------
const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, "").split("=");
    return [k, v ?? true];
  })
);

// URI priority: CLI > .env(MONGODB_URI/MONGO_URI) > sensible default
const URI =
  args.uri ||
  process.env.MONGODB_URI ||
  process.env.MONGO_URI ||
  "mongodb://127.0.0.1:27017/olympiadDB";

// DB name: --db overrides; else infer from URI path; else "test"
let DB_NAME = args.db;
if (!DB_NAME) {
  try {
    const u = new URL(URI);
    DB_NAME = u.pathname.replace(/^\//, "") || "test";
  } catch {
    DB_NAME = "test";
  }
}

// Sample size: CLI flag only (default 1000)
const SAMPLE_SIZE = Number(args.sample || 1000);

// ---------- helpers ----------
function typeOf(v) {
  if (v === null) return "Null";
  if (Array.isArray(v)) {
    const inner = [...new Set(v.map(typeOf))];
    return `Array<${inner.length ? inner.join("|") : "Mixed"}>`;
  }
  if (v instanceof ObjectId) return "ObjectId";
  if (v instanceof Date) return "Date";
  if (v instanceof Decimal128) return "Decimal128";
  if (v instanceof Long || v instanceof Int32 || v instanceof Double)
    return "Number";
  const t = typeof v;
  return t === "object" ? "Object" : t[0].toUpperCase() + t.slice(1);
}

function mdEscape(s = "") {
  return String(s).replace(/\|/g, "\\|").replace(/\n/g, " ");
}

/**
 * Flattens fields into dot paths.
 * - Tracks presence count, set of types, and an example value per path
 * - For arrays, also adds a "path[]" pseudo-field to show element types
 */
function flatten(doc, prefix = "", acc = {}) {
  // Primitive or terminal node
  const isTerminal =
    doc === null ||
    doc instanceof Date ||
    doc instanceof ObjectId ||
    doc instanceof Decimal128 ||
    doc instanceof Long ||
    doc instanceof Int32 ||
    doc instanceof Double ||
    typeof doc !== "object" ||
    Buffer.isBuffer?.(doc);

  if (isTerminal) {
    if (!prefix) return acc; // root shouldn't be terminal
    acc[prefix] = acc[prefix] || {
      count: 0,
      types: new Set(),
      example: undefined,
    };
    acc[prefix].count++;
    acc[prefix].types.add(typeOf(doc));
    if (acc[prefix].example === undefined) acc[prefix].example = doc;
    return acc;
  }

  // Arrays
  if (Array.isArray(doc)) {
    // track the array field itself
    acc[prefix] = acc[prefix] || {
      count: 0,
      types: new Set(),
      example: undefined,
    };
    acc[prefix].count++;
    acc[prefix].types.add(typeOf(doc));
    if (acc[prefix].example === undefined)
      acc[prefix].example = doc.slice(0, 2);

    const elementTypes = new Set(doc.map(typeOf));
    const elemKey = `${prefix}[]`;
    acc[elemKey] = acc[elemKey] || {
      count: 0,
      types: new Set(),
      example: undefined,
    };
    acc[elemKey].count++;
    elementTypes.forEach((t) => acc[elemKey].types.add(t));
    if (acc[elemKey].example === undefined && doc.length)
      acc[elemKey].example = doc[0];

    // Flatten array elements that are objects
    doc
      .filter((x) => x && typeof x === "object" && !Array.isArray(x))
      .forEach((obj) => flatten(obj, elemKey, acc));

    return acc;
  }

  // Objects
  for (const [k, v] of Object.entries(doc)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (
      v &&
      typeof v === "object" &&
      !Array.isArray(v) &&
      !(v instanceof Date) &&
      !(v instanceof ObjectId)
    ) {
      flatten(v, key, acc);
    } else if (Array.isArray(v)) {
      // track array field and its inner/object fields
      flatten(v, key, acc);
    } else {
      acc[key] = acc[key] || { count: 0, types: new Set(), example: undefined };
      acc[key].count++;
      acc[key].types.add(typeOf(v));
      if (acc[key].example === undefined) acc[key].example = v;
    }
  }
  return acc;
}

// ---------- main ----------
(async () => {
  const client = new MongoClient(URI, { ignoreUndefined: true });
  let wrote = "";
  try {
    await client.connect();
    const db = client.db(DB_NAME);

    const header = [];
    header.push(`# MongoDB Schema – ${DB_NAME}`);
    header.push(`_Last generated: ${new Date().toISOString()}_`);
    header.push("");
    let md = header.join("\n") + "\n";

    const colls = await db.listCollections().toArray();
    if (!colls.length) {
      console.warn(`No collections found in DB "${DB_NAME}".`);
    }

    for (const c of colls) {
      const name = c.name;
      const coll = db.collection(name);

      // sample documents (prefer $sample, fallback to find().limit())
      let sampleDocs = [];
      try {
        sampleDocs = await coll
          .aggregate([{ $sample: { size: SAMPLE_SIZE } }])
          .toArray();
      } catch {
        sampleDocs = await coll.find({}).limit(SAMPLE_SIZE).toArray();
      }
      const n = Math.max(sampleDocs.length, 1);

      // fields
      const fieldMap = {};
      sampleDocs.forEach((d) => flatten(d, "", fieldMap));

      md += `\n## ${name}\n`;
      md += `### Fields\n`;
      md += `| Field (dot path) | Type(s) | Presence | Example |\n`;
      md += `|---|---|---:|---|\n`;
      Object.keys(fieldMap)
        .sort()
        .forEach((k) => {
          const info = fieldMap[k];
          const presence = ((info.count / n) * 100).toFixed(1) + "%";
          const types = [...info.types].join("|");
          const exampleStr = mdEscape(
            EJSON.stringify(info.example, { relaxed: true })
          );
          md += `| \`${k}\` | ${types} | ${presence} | \`${exampleStr}\` |\n`;
        });

      // indexes
      const idx = await coll.indexes();
      md += `\n### Indexes\n`;
      md += `| Name | Keys (order) | Unique | TTL (s) | Partial Filter |\n`;
      md += `|---|---|:---:|:---:|---|\n`;
      idx.forEach((i) => {
        const keys = mdEscape(JSON.stringify(i.key));
        const partial = i.partialFilterExpression
          ? mdEscape(JSON.stringify(i.partialFilterExpression))
          : "";
        md += `| \`${i.name}\` | \`${keys}\` | ${i.unique ? "✓" : ""} | ${
          i.expireAfterSeconds ?? ""
        } | \`${partial}\` |\n`;
      });

      // validation (JSON Schema) if present
      // NOTE: listCollections returns options for each collection, but we re-query to be safe
      const infos = await db.listCollections({ name }).toArray();
      const validator = infos?.[0]?.options?.validator;
      if (validator) {
        md += `\n### Validation (JSON Schema)\n`;
        md += "```json\n";
        md += EJSON.stringify(validator, { relaxed: false, indent: 2 }) + "\n";
        md += "```\n";
      }

      // sample document
      if (sampleDocs[0]) {
        md += `\n### Sample document\n`;
        md += "```json\n";
        md +=
          EJSON.stringify(sampleDocs[0], { relaxed: false, indent: 2 }) + "\n";
        md += "```\n";
      }

      md += `\n> Sampled ${n} document(s).\n\n---\n`;
    }

    const outDir = path.join(process.cwd(), "docs");
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    const outFile = path.join(outDir, "SCHEMA.md");
    fs.writeFileSync(outFile, md, "utf8");
    wrote = outFile;
    console.log("✔ Wrote", outFile);
  } catch (e) {
    console.error("Schema doc generation failed:", e?.message || e);
    process.exitCode = 1;
  } finally {
    await client.close().catch(() => {});
  }
})();
