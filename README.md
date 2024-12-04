# NS Travel Information MCP Server

An MCP server that provides access to NS (Dutch Railways) travel information.

## Setup

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
4. Add your NS API key to the `.env` file:
   ```
   NS_API_KEY=your_api_key_here
   ```
   You can get an API key from [NS API Portal](https://apiportal.ns.nl/)

5. Run the server:
   ```bash
   npm start
   ```

## Environment Variables

| Variable | Description |
|----------|-------------|
| NS_API_KEY | Your NS API key (required) |
