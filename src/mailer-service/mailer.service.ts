/**
 * MailerService
 * -------------------------------
 * A Kafka consumer service for handling `order.created` events.
 * Listens to the topic and triggers email notifications upon receiving valid order messages.
 * 
 * Author: Supakrit65
 * Date: 25-04-2025
 */

import { Kafka, Consumer, EachMessagePayload } from "kafkajs";
import { OrderCreatedEvent } from "../types/index.ts";

// List of Kafka topics the service subscribes to
const TOPICS = ["order.created"];

/**
 * MailerService class
 * Handles Kafka consumption and processes email notifications for order events.
 */
class MailerService {
  private readonly kafka: Kafka;
  private readonly consumer: Consumer;

  constructor(brokerList: string[], clientId = "mailer-service", groupId = "mailer-service-group") {
    this.kafka = new Kafka({ clientId, brokers: brokerList });
    this.consumer = this.kafka.consumer({ groupId });
  }

  /**
   * Connects the consumer to Kafka and starts listening to specified topics.
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

    console.log("[MailerService] Listening for messages...");
  }

  /**
   * Gracefully disconnects the consumer from Kafka.
   */
  async stop(): Promise<void> {
    await this.consumer.disconnect();
    console.log("[Kafka] Consumer disconnected");
  }

  /**
   * Handles incoming Kafka messages and processes notifications.
   * @param payload - The Kafka message payload
   */
  private async handleMessage({ topic, partition, message }: EachMessagePayload): Promise<void> {
    console.log(`[Kafka] Message received from topic ${topic} [partition ${partition}] [${message.offset}]`);

    try {
      const orderData: OrderCreatedEvent = JSON.parse(message.value?.toString() ?? '{}');
      await this.processOrderNotification(orderData);
    } catch (error) {
      console.error("[MailerService] Failed to process message:", error);
    }
  }

  /**
   * Simulates sending an email notification for a created order.
   * Replace this with actual integration (e.g., Nodemailer, SendGrid).
   * @param order - The order payload from the Kafka event
   */
  private async processOrderNotification(order: OrderCreatedEvent): Promise<void> {
    console.log(`[MailerService] Sending email notification for order ID: ${order.orderId}`);
  
    console.table({
      OrderID: order.orderId,
      Email: order.userEmail,
      ProductID: order.productId,
      Quantity: order.quantity,
      Price: `$${order.price.toFixed(2)}`,
      Address: order.shippingAddress,
      Payment: order.paymentMethod,
      Time: order.timestamp,
    });
  
    // TODO: Implement real email sending logic here
  }
}

// === Entry point ===

const mailerService = new MailerService(["localhost:9094", "localhost:9095", "localhost:9096"]);

async function bootstrap() {
  try {
    await mailerService.start();
  } catch (error) {
    console.error("[MailerService] Error during startup:", error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n[System] Shutting down MailerService...");
  await mailerService.stop();
  process.exit(0);
});

bootstrap();
