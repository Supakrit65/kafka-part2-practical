import autocannon from "autocannon";
import { nanoid } from "nanoid";

/**
 * Generates a randomized order payload for benchmarking.
 */
function generateOrderPayload() {
  return JSON.stringify({
    userEmail: `user_${nanoid(6)}@example.com`,
    productId: `prod-${nanoid(5)}`,
    quantity: Math.floor(Math.random() * 5) + 1,
    price: parseFloat((Math.random() * 100).toFixed(2)),
    shippingAddress: "123 Benchmark Ave, Load City",
    paymentMethod: "credit_card",
    sendUserUpdate: false,
  });
}

// Create the instance
const instance = autocannon({
  url: "http://localhost:3000/api/v1/orders",
  method: "POST",
  connections: 100,
  pipelining: 1,
  duration: 10,
  headers: {
    "Content-Type": "application/json",
  },
  body: generateOrderPayload(),
  setupClient: (client) => {
    const body = generateOrderPayload();
    client.setBody(body);
  },
}) as unknown as autocannon.Instance;

// Logging lifecycle
autocannon.track(instance, {
  renderProgressBar: true,
  renderResultsTable: true,
  renderLatencyTable: true,
});

instance.on("done", (result: autocannon.Result) => {
  console.log("🏁 Benchmark finished!");
  console.log("Results:", result);
});