/**
 * UserService
 * -------------------------------
 * A Kafka consumer service for handling `user.updated` and `order.created` events.
 * Designed to support user-related processing logic based on Kafka messages.
 * 
 * Author: Supakrit65
 * Date: 25-04-2025
 */

import { Kafka, Consumer, EachMessagePayload } from "kafkajs";
import { OrderCreatedEvent } from "../types/index.ts";

// List of subscribed Kafka topics
const TOPICS = ["user.updated", "order.created"];

/**
 * UserService class
 * Handles Kafka message consumption and user-related event processing.
 */
class UserService {
  private readonly kafka: Kafka;
  private readonly consumer: Consumer;

  constructor(brokerList: string[], clientId = "user-service", groupId = "user-service-group") {
    this.kafka = new Kafka({ clientId, brokers: brokerList });
    this.consumer = this.kafka.consumer({ groupId });
  }

  /**
   * Connects and starts consuming Kafka topics.
   */
  async start(): Promise<void> {
    await this.consumer.connect();
    console.log("[Kafka] Consumer connected");

    for (const topic of TOPICS) {
      await this.consumer.subscribe({ topic, fromBeginning: true });
      console.log(`[Kafka] Subscribed to topic: ${topic}`);
    }

    await this.consumer.run({
      eachMessage: async (payload: EachMessagePayload) => {
        await this.handleMessage(payload);
      },
    });

    console.log("[UserService] Listening for messages...");
  }

  /**
   * Gracefully disconnects the Kafka consumer.
   */
  async stop(): Promise<void> {
    await this.consumer.disconnect();
    console.log("[Kafka] Consumer disconnected");
  }

  /**
   * Processes a single Kafka message by topic type.
   * @param payload - Kafka message payload
   */
  private async handleMessage({ topic, partition, message }: EachMessagePayload): Promise<void> {
    console.log(`[Kafka] Message received from topic ${topic} [partition ${partition}]`);
  
    try {
      const value = message.value?.toString() ?? '{}';
      const parsed: OrderCreatedEvent = JSON.parse(value);
      const offset = message.offset;
  
      await this.processUserUpdate(parsed, partition, offset);
    } catch (error) {
      console.error("[UserService] Failed to process message:", error);
    }
  }

  /**
   * Handles both order.created and user.updated events as user update operations.
   * @param userData - Payload from Kafka (either order or user update)
   */
  private async processUserUpdate(
    userData: OrderCreatedEvent,
    partition: number,
    offset: string
  ): Promise<void> {
    console.log(`[UserService] Processing user update (partition: ${partition}, offset: ${offset})`);
    console.table(userData);
  
    // TODO: Implement user update logic here
  }
}

// === Entry point ===

const userService = new UserService(["localhost:9094", "localhost:9095", "localhost:9096"]);

async function bootstrap() {
  try {
    await userService.start();
  } catch (error) {
    console.error("[UserService] Error during startup:", error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n[System] Shutting down UserService...");
  await userService.stop();
  process.exit(0);
});

bootstrap();
