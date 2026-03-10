# Local AI Chatbot Platform

A modular AI chatbot platform that runs **fully offline** using local LLMs.

The system is built with a distributed architecture separating:

* Frontend UI
* Backend API
* AI Agent Service

This architecture allows the system to scale and evolve independently while keeping the AI logic isolated from the application backend.

---

# System Architecture

The platform is composed of three repositories:

Frontend
ChatBotWeb (Angular)

Backend
LocalChatBotApi (ASP.NET / C#)

AI Service
ai-agent-service (Python / LangGraph)

Flow:

User

↓

Angular Chat UI

↓

ASP.NET Backend API

↓

Python AI Agent Service

The backend acts as the orchestration layer between the UI and the AI agent.

---

# Features

* Local LLM execution (offline capable)
* AI agent with tools
* Real-time streaming responses
* Agent reasoning visualization
* Conversation persistence
* Modular microservice architecture

The system allows users to interact with an AI assistant while observing the **steps the agent takes to generate its answers**, including searches, tool calls and retrieved sources.

---

# Repositories

## ChatBotWeb

Angular application that provides the chatbot interface.

Responsibilities:

* chat UI
* real time streaming rendering
* visualization of agent events
* conversation management

---

## LocalChatBotApi

ASP.NET backend responsible for application logic.

Responsibilities:

* user management
* chat session persistence
* conversation history
* message storage
* communication with the AI service

---

## ai-agent-service

Python microservice implementing the AI agent.

Responsibilities:

* agent reasoning
* tool execution
* knowledge retrieval (RAG)
* streaming responses
* agent event generation

---

# Technologies Used

Frontend

* Angular
* TypeScript

Backend

* ASP.NET
* C#
* SQL Server

AI Service

* Python
* LangGraph
* LangChain
* SQLite
* Local LLMs

---

# AI Agent Capabilities

The AI service runs an agent capable of:

* executing tools
* searching information
* retrieving knowledge
* summarizing results
* generating structured responses

During execution the system streams agent events such as:

* search queries
* sources discovered
* tool executions
* reasoning steps

This makes the chatbot **transparent and explainable**.

---

# Goal of the Project

This project explores how to build a **modular AI platform using local models**, focusing on:

* privacy
* architecture
* agent orchestration
* tool integration
* explainable AI systems

---

# Future Improvements

* RAG knowledge bases
* long term memory
* document ingestion pipelines
* automated reporting
* multi agent workflows
