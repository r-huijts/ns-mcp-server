# NS Travel Information MCP Server

Transform your AI assistant into a Dutch railways expert. This Model Context Protocol (MCP) server connects Claude, Copilot, or compatible agents to real-time NS (Nederlandse Spoorwegen) travel information.

## Features

- Real-time disruptions and maintenance alerts
- Departure and arrival information
- Train travel advice and route planning
- Price queries for tickets
- Station lookup and station metadata
- Natural-language travel assistance via MCP tools

## Installation

### Install dependencies

```bash
npm install
```

### Configure environment variables

Create a `.env` file:

```env
NS_API_KEY=your_ns_api_key_here
```

You can obtain your key from the NS API portal:
https://apiportal.ns.nl/

## Running the server

```bash
npm run build
node build/index.js
```

## MCP configuration

Add this to your MCP client configuration:

```json
{
  "mcpServers": {
    "ns-server": {
      "command": "node",
      "args": [
        "/absolute/path/to/ns-mcp-server/build/index.js"
      ],
      "env": {
        "NS_API_KEY": "your_ns_api_key_here"
      }
    }
  }
}
```

### Example with Claude Desktop / Cursor / compatible clients

```json
{
  "mcpServers": {
    "ns-server": {
      "command": "npx",
      "args": ["-y", "ns-mcp-server"],
      "env": {
        "NS_API_KEY": "your_ns_api_key_here"
      }
    }
  }
}
```

## GitHub Copilot and GitHub.com usage

This MCP server is especially useful when your Copilot agent needs real travel data while answering questions.

### Tool name

- `ask_ns`

### Example prompts

- “Are there any disruptions between Amsterdam and Utrecht?”
- “What trains depart from Utrecht Centraal in the next hour?”
- “What is the fare from Amsterdam to Rotterdam?”
- “What is the best route from Rotterdam to Utrecht today?”
- “Is there disruption on the Rotterdam line?”
- “Which trains are arriving at Amsterdam Centraal now?”

### Example MCP tool call

```json
{
  "name": "ask_ns",
  "arguments": {
    "query": "Are there any disruptions between Amsterdam and Utrecht?"
  }
}
```

The agent detects the user intent, calls the correct NS API endpoint, and returns a summarized result.

## Available capabilities

- disruptions
- departures
- arrivals
- prices
- travel advice
- station info

## Development

```bash
npm install
npm run build
```

## License

MIT
