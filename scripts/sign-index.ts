import { readFile, writeFile } from "node:fs/promises";
import { createPrivateKey, sign } from "node:crypto";
import path from "node:path";

type SignaturePayload = {
  schema_version: 1;
  key_id: string;
  signature: string;
  algorithm?: string;
};

function parseArgs(argv: string[]): { keyPath: string; keyId: string } {
  const keyFlag = argv.indexOf("--key");
  if (keyFlag === -1 || !argv[keyFlag + 1]) {
    throw new Error("Usage: node scripts/sign-index.ts --key <private-key.pem> [--key-id <id>]");
  }
  const keyPath = argv[keyFlag + 1];
  const idFlag = argv.indexOf("--key-id");
  const keyId = idFlag !== -1 && argv[idFlag + 1] ? argv[idFlag + 1] : "unknown";
  return { keyPath, keyId };
}

async function main(): Promise<void> {
  const { keyPath, keyId } = parseArgs(process.argv.slice(2));
  const indexPath = path.join(process.cwd(), "index.json");
  const sigPath = path.join(process.cwd(), "index.json.sig");
  const [indexText, keyText] = await Promise.all([
    readFile(indexPath),
    readFile(path.resolve(keyPath), "utf8"),
  ]);
  const privateKey = createPrivateKey(keyText);
  const signature = sign(null, indexText, privateKey).toString("base64");
  const payload: SignaturePayload = {
    schema_version: 1,
    key_id: keyId,
    algorithm: "ed25519",
    signature,
  };
  await writeFile(sigPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
