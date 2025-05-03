# Kafka Practical Demo

![Kafka Flow](./assets/kafka-part2.drawio.png)

Welcome to this **Kafka practical demo project**!
Inspired by the excellent **"Kafka Fundamentals"** series by [SWE with Vivek Bharatha](https://www.youtube.com/@swe-with-vivekbharatha), this hands-on setup helps you deeply understand how Kafka works in real-world microservice architectures.

> 🚀 This project showcases **event-driven communication** using Kafka across multiple services with different Kafka deployment setups.

---

## 📚 What You'll Learn

* Kafka Core Concepts: Topics, Partitions, Brokers, Consumer Groups
* Setting up Kafka using Docker (KRaft and ZooKeeper modes)
* Producing and Consuming Events
* Partition Rebalancing & Failover Handling
* Load Testing with `autocannon`
* Visualizing Topic/Consumer State with Kafka UI

---

## 🔧 Docker Setup Options

This project provides **3 Docker Compose setups** to run Kafka locally:

| Mode             | File Path                   | Description                                                    |
| ---------------- | ------------------------ | -------------------------------------------------------------- |
| `kraft-combined` | `docker-compose.kraft.combine.yaml` | Kafka in KRaft mode (combined controller + broker per node)    |
| `kraft-split`    | `docker-compose.kraft.split.yaml`    | Kafka in KRaft mode (dedicated controllers + separate brokers) |
| `zookeeper`      | `docker-compose.zookeeper.yaml`      | Traditional setup using ZooKeeper                              |

### 💡 Choose one mode to run at a time.

To bring up your chosen Kafka stack:

```bash
# Example (kraft-combined):
docker-compose -f docker-compose.kraft.combine.yaml up -d
```

### 🔌 Service Ports

| Service             | Port             | Description                                     |
| ------------------- | ---------------- | ----------------------------------------------- |
| Kafka Brokers       | 9094, 9095, 9096 | External listeners for producer/consumer apps   |
| Zookeeper (if used) | 2181             | Required for ZooKeeper-based mode               |
| Kafka UI            | 8080             | Web UI to monitor topics, partitions, consumers |

---

## 📁 Project Structure

| Path                  | Description                                 |
| --------------------- | ------------------------------------------- |
| `src/init.ts`         | Script to bootstrap Kafka topics            |
| `src/order-service/`  | Producer service for order events           |
| `src/mailer-service/` | Consumer service for email notifications    |
| `src/user-service/`   | Consumer service for user and order updates |
| `src/types/`          | Shared TypeScript interfaces                |
| `src/ac.ts`           | Load test using `autocannon`                |
| `assets/`             | Architecture diagrams                       |
| `tsconfig.json`       | TypeScript config                           |

---

## 🚀 How to Run

### 1. Create Topics

```bash
npm run init
```

This creates:

* `order.created` (3 partitions)
* `user.updated` (1 partition)

---

### 2. Start Services

Each service simulates part of a real system:

| Service        | Role                    | Command                  |
| -------------- | ----------------------- | ------------------------ |
| Order Service  | Producer                | `npm run order-service`  |
| Mailer Service | Consumer Group (mailer) | `npm run mailer-service` |
| User Service   | Consumer Group (user)   | `npm run user-service`   |

---

### 3. Load Test Kafka (Optional)

```bash
npm run ac
```

This triggers thousands of order events to simulate real load.

---

## 🧠 Concepts Demonstrated

* Producer message routing using keys
* Consumer group load balancing
* Partition rebalancing and failover
* Kafka topic replication and durability
* Consumer throughput under load

---

## 🖥️ Kafka Architecture Overview

The following diagram shows the producer-consumer interaction using Kafka:

![Kafka Architecture](./assets/kafka-part2.drawio.png)

---

## 📖 Credits

> 🎥 [Kafka Fundamentals Every Developer Must Know - Part 2](https://www.youtube.com/watch?v=YOUR_VIDEO_LINK)
> By **SWE with Vivek Bharatha**

* YouTube: [@swe-with-vivekbharatha](https://www.youtube.com/@swe-with-vivekbharatha)
* GitHub: [vivekbharatha](https://github.com/vivekbharatha)
* Medium: [@vivek.bharatha](https://medium.com/@vivek.bharatha)
