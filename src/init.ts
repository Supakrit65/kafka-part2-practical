import { ITopicConfig, Kafka } from "kafkajs";

const clientId = "init";
const brokers = ["localhost:9094", "localhost:9095", "localhost:9096"];

const topicsToCreate: ITopicConfig[] = [
  {
    topic: "order.created",
    numPartitions: 3,
    replicationFactor: 3,
  },
  {
    topic: "user.updated",
    numPartitions: 1,
    replicationFactor: 3,
  },
];

const kafka = new Kafka({
  clientId,
  brokers,
});

const main = async () => {
  const admin = kafka.admin();

  try {
    await admin.connect();
    console.log("Connected to Kafka");

    const existingTopics = await admin.listTopics();
    console.log("Existing topics:", existingTopics);

    // Filter out internal topics like __consumer_offsets
    const topicsToDelete = existingTopics.filter(topic => !topic.startsWith('__'));

    if (topicsToDelete.length > 0) {
      await admin.deleteTopics({
        topics: topicsToDelete,
        timeout: 5000,
      });
      console.log("Deleted topics:", topicsToDelete);
    } else {
      console.log("No user-created topics to delete.");
    }

    // Wait for a short period to ensure topics are deleted
    await new Promise(resolve => setTimeout(resolve, 5000));

    const created = await admin.createTopics({
      topics: topicsToCreate,
      waitForLeaders: true,
    });

    // Wait for a short period to ensure topics are created
    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log("Created topics:", created);
  } catch (error) {
    console.error("Error handling Kafka topics:", error);
  } finally {
    await admin.disconnect();
    console.log("Disconnected from Kafka");
  }
};

main().catch(console.error);
