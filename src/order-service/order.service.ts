/**
 * OrderService
 * -------------------------------
 * A Kafka producer service with a REST API for publishing `order.created` events.
 * Also emits `user.updated` events based on request parameters.
 * 
 * Author: Supakrit65
 * Date: 25-04-2025
 */

import express from "express";
import bodyParser from "body-parser";
import { nanoid } from "nanoid";
import { Kafka, Producer } from "kafkajs";
import { OrderCreatedEvent, OrderCreatedEventPayload } from "../types/index.ts";

const app = express();
const PORT = process.env.PORT ?? 3000;

// Kafka configuration
const kafka = new Kafka({
  clientId: "order-service",
  brokers: ["localhost:9094"],
});

/**
 * OrderService class
 * Handles Kafka producer operations for order and user events.
 */
class OrderService {
  private readonly producer: Producer;

  constructor() {
    this.producer = kafka.producer();
  }

  /**
   * Initializes the Kafka producer connection.
   */
  async init(): Promise<void> {
    try {
      await this.producer.connect();
      console.log("[Kafka] Producer connected.");
    } catch (error) {
      console.error("[Kafka] Error initializing producer:", error);
    }
  }

  /**
   * Disconnects the Kafka producer.
   */
  async stop(): Promise<void> {
    await this.producer.disconnect();
    console.log("[Kafka] Producer disconnected.");
  }

  /**
   * Sends an `order.created` event to Kafka.
   * @param orderData - Incoming order data from HTTP request
   * @returns the full message payload including generated order ID and timestamp
   */
  async createOrder(orderData: OrderCreatedEventPayload) {
    const orderId = nanoid(10);
    const key = orderData.userEmail || Date.now().toString();
    const payload = {
      orderId,
      ...orderData,
      timestamp: new Date().toISOString(),
    };

    try {
      console.log(`[Kafka] Publishing 'order.created' with key: ${key}`);
      await this.producer.send({
        topic: "order.created",
        messages: [{ key, value: JSON.stringify(payload) }],
      });

      return payload;
    } catch (error) {
      console.error("[OrderService] Failed to publish order:", error);
      throw new Error("Failed to create order");
    }
  }

  /**
   * Sends a `user.updated` event to Kafka.
   * @param userEmail - User's email to update
   * @param orderData - Order data to include in the user update
   */
  async updateUser(userEmail: string, createdOrderData: OrderCreatedEvent): Promise<void> {
    const key = userEmail;
    try {
      console.log(`[Kafka] Publishing 'user.updated' with key: ${key}`);
      await this.producer.send({
        topic: "user.updated",
        messages: [{ key, value: JSON.stringify(createdOrderData) }],
      });

      console.log("[OrderService] User update published.");
    } catch (error) {
      console.error("[OrderService] Failed to publish user update:", error);
      throw new Error("Failed to update user");
    }
  }
}

// === API Setup ===

const orderService = new OrderService();

app.use(bodyParser.json());

/**
 * POST /api/v1/orders
 * Creates a new order and optionally updates user metadata.
 */
app.post("/api/v1/orders", async (req, res) => {
  try {
    const order: OrderCreatedEventPayload = req.body;
    const createdOrder = await orderService.createOrder(order);

    if (order.sendUserUpdate && order.userEmail) {
      await orderService.updateUser(order.userEmail, createdOrder);
    }

    res.status(201).json(createdOrder);
  } catch (error) {
    console.error("[API] Error handling order creation:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * Start Express server and connect Kafka producer.
 */
app.listen(PORT, async () => {
  console.log(`[Express] Order service running on port ${PORT}`);
  await orderService.init();
});

/**
 * Graceful shutdown on process termination
 */
process.on("SIGINT", async () => {
  console.log("\n[System] Shutting down OrderService...");
  await orderService.stop();
  process.exit(0);
});
