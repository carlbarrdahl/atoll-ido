import crypto from "crypto";

// Out of scope for proof of concept
const encrypt = (string) => string;
const decrypt = (string) => string;

function createKey() {
  const random = crypto.randomBytes(20);

  return random.toString("hex");
}

async function verifyKey(key) {
  // Get key from Authorization Bearer
  // Find key in database
}

describe("Firebase functions", () => {
  test("Create API Key", () => {
    const key = createKey();
    expect(key).toBeDefined();
  });
});
