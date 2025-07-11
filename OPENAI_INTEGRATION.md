# OpenAI Integration for Assignment Writer

## Overview

The assignment writer functionality has been updated to use OpenAI's API instead of the previous Groq/OpenRouter implementation.

## Changes Made

### 1. New OpenAI Client (`lib/openai-client.ts`)

- Created a new OpenAI client configuration using the provided API key and base URL
- Includes fallback functionality for model switching
- Supports temperature and max_tokens configuration
- Error handling for API failures

### 2. Updated Assignment API (`app/api/assignment/route.ts`)

- Replaced Groq client with OpenAI client
- Updated model types from OpenRouter models to OpenAI models:
  - `ninja-3.2` → `gpt-4`
  - `stealth-2.0` → `gpt-4-turbo`
  - `ghost-1.5` → `gpt-3.5-turbo`
- Maintains all existing functionality including:
  - User authentication
  - Daily word limits for free users
  - Document upload support
  - Academic writing styles
  - Human-like level control

### 3. Updated Assignment Writer Component (`components/assignment-writer.tsx`)

- Changed default model from `ninja-3.2` to `gpt-4`
- Updated model selection options to show OpenAI models
- Maintains all existing UI and functionality

### 4. Updated Model Info Card (`components/model-info-card.tsx`)

- Added OpenAI models to the model information display
- Updated default fallback model to `gpt-4`
- Maintains compatibility with existing models

## API Configuration

- **API Key**: `sk-KtmxXFJvmB1IYnFojdEamBKEWDtIpuD6GdyypWhbRjCBxcm0`
- **Base URL**: `https://api.chatanywhere.tech/v1`
- **Supported Models**: `gpt-4`, `gpt-4-turbo`, `gpt-3.5-turbo`

## Environment Variables (Optional)

You can override the API configuration using environment variables:

- `OPENAI_API_KEY`: Your OpenAI API key
- `OPENAI_BASE_URL`: Your OpenAI base URL

## Testing

A test file has been created at `lib/test-openai.ts` to verify the OpenAI connection.

## Usage

The assignment writer now uses OpenAI models by default. Users can select from:

- **GPT-4**: Highest quality, slower responses
- **GPT-4 Turbo**: Fast and high quality
- **GPT-3.5 Turbo**: Fastest responses

All existing features remain functional, including document upload, academic writing styles, and human-like level control.
