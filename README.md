# ♟️ ChessWithBuddy
### *A real-time multiplayer chess platform that lets you play chess with your friends, featuring low-latency gameplay and robust message queuing.*

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-blue.svg)](#)
[![Docker Support](https://img.shields.io/badge/docker-ready-blue?logo=docker)](#)

## 🎨 Preview

! Home Page - Create or Join a Game![alt text](/assets/preview-home.png)
! In-Game Chess Board![alt text](/assets/preview-game.png)
! Checkmate & Game Over![alt text](/assets/preview-gameover.png)

## 🏗 Architecture 

![Architecture Diagram](/assets/architecture.png)

The application follows a distributed, highly scalable architecture:
1. **Frontend**: A React web application that connects to the backend network via WebSockets for real-time multiplayer functionality.
2. **Backend**: A Node.js server using WebSockets (`ws`) to manage game state with `chess.js`, handle matchmaking, and publish game moves and state changes to a Kafka topic.
3. **Message Broker**: Apache Kafka is used to queue all incoming moves asynchronously, ensuring that bursts of gameplay activity never overwhelm the database.
4. **DB Worker**: An independent Node.js worker service that continuously consumes messages from the Kafka topics and reliably persists the moves and game records into MongoDB.

## 🛠 Tech Stack

* **Frontend:** React, TailwindCSS, Vite
* **Backend:** Node.js, WebSockets (`ws`), `chess.js`
* **Worker Service:** Node.js, KafkaJS, Mongoose
* **Database:** MongoDB
* **Message Broker:** Apache Kafka
* **Infrastructure:** Kubernetes, Docker, AWS (EC2), GitHub Actions for CI/CD

## 🚀 Deploying the Backend
This project relies on Kubernetes to orchestrate the backend services (WebSocket server, Kafka, message consumer, and MongoDB). Follow these steps to deploy the backend on your own infrastructure (e.g., Minikube, AWS EKS, or standard EC2 running k3s).

### 1. Prerequisites
Ensure you have the following installed on your machine:
* `kubectl` (Kubernetes command-line tool)
* Docker
* A running Kubernetes cluster

### 2. Configure Your Secrets
Before deploying, you must provide your sensitive environment variables (such as your MongoDB URI). These should never be hardcoded into your `.yml` files. 

Create a `.env` file or export your variables directly to your environment, then run the following command to create a Kubernetes secret called `backend-secrets` (used by both the `backend` and `db-worker`):

```bash
kubectl create secret generic backend-secrets \
  --from-literal=MONGO_URI=your_mongodb_connection_string
```
**⚠️ Note:** You must manually substitute `your_mongodb_connection_string` with your actual database connection string. Do not commit these credentials to version control!

### 3. Deploy the Infrastructure

We have organized the Kubernetes definitions into the `k8s/` folder. Deploy the resources in this order:

```bash
# First, apply the namespace if one is defined
kubectl apply -f k8s/namespace.yml

# Check the namespace status
kubectl get namespace

# Now, deploy the individual services and deployments
kubectl apply -f k8s/backend-deployment.yml
# Include other components like Kafka and your DB worker once defined...
# e.g., kubectl apply -f k8s/kafka-statefulset.yml
```

### 4. Verify the Deployment
Once all the configuration files are applied, verify that the pods are running correctly:

```bash
kubectl get pods
kubectl get services
```

Your backend WebSocket service should now be live and ready to accept connections from the React frontend!
