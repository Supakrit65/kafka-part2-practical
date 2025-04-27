import { ITopicConfig, Kafka } from "kafkajs";

const clientId = "init";
const brokers = ["localhost:9094"];

const topicsToCreate: ITopicConfig[] = [
  {
    topic: "order.created",
    numPartitions: 3,
    replicationFactor: 1,
  },
  {
    topic: "user.updated",
    numPartitions: 1,
    replicationFactor: 1,
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

    const created = await admin.createTopics({
      topics: topicsToCreate,
      waitForLeaders: true,
    });

    console.log("Created topics:", created);
  } catch (error) {
    console.error("Error handling Kafka topics:", error);
  } finally {
    await admin.disconnect();
    console.log("Disconnected from Kafka");
  }
};

main().catch(console.error);
