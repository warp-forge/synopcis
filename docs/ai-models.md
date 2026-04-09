# AI Models Infrastructure Guide

This guide explains how to set up the local environment for running AI models (e.g., Qwen) used by the application's AI worker for operations such as embedding generation, Named Entity Recognition (NER), source verification, and translation.

## Prerequisites

- A machine with a CUDA-compatible GPU (e.g., NVIDIA) is recommended for fast processing. However, models can also run on CPU.
- Ensure Docker is installed, or tools like Ollama/vLLM depending on your preferred execution engine.

## Installing Ollama

Ollama provides a straightforward way to run large language models locally.

1. **Install Ollama**
   Follow the instructions on [ollama.com](https://ollama.com/download) for your OS.
   For Linux:
   `curl -fsSL https://ollama.com/install | bash`

2. **Start the Ollama server**
   `ollama serve`

## Managing GPU Resources

Ollama automatically detects and utilizes available GPUs. You can control which GPUs are visible to Ollama using environment variables.

- **Limit to specific GPUs:** Set the `CUDA_VISIBLE_DEVICES` environment variable before running Ollama. For example, to use only the first GPU:
  `CUDA_VISIBLE_DEVICES=0 ollama serve`

## Downloading Models

We recommend using the Qwen model for general text tasks and translation.

1. **Pull Qwen**
   `ollama pull qwen:7b`

2. **Pull specialized embedding model (optional)**
   `ollama pull mxbai-embed-large`

## Integrating with the Application

The `worker-ai` service connects to these models. You need to provide the Ollama API URL in the environment variables:

```env
OLLAMA_API_URL=http://localhost:11434
```

This ensures that the internal operations such as semantic embedding, named entity recognition, and translations are sent to your local instance securely.
