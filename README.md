| <img src="https://upload.wikimedia.org/wikipedia/commons/b/b7/Nederlandse_Spoorwegen_logo.svg" alt="NS Logo" width="380"/> | <img src="https://glama.ai/mcp/servers/tzd5oz5tov/badge" alt="NS Travel Information Server MCP server" width="380"/> |
|:---:|:---:|

# NS Travel Information MCP Server

[![smithery badge](https://smithery.ai/badge/ns-server)](https://smithery.ai/server/ns-server)
[![npm version](https://badge.fury.io/js/ns-mcp-server.svg)](https://www.npmjs.com/package/ns-mcp-server)

Transform your AI assistant into a Dutch railways expert! This MCP server connects Claude to real-time NS (Nederlandse Spoorwegen) travel information, making it your perfect companion for navigating the Netherlands by train.

## Installation

You can install this server in three ways:

### 1. Using Claude Desktop with NPM Package

Update your Claude configuration file (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "ns-server": {
      "command": "npx",
      "args": [
        "-y",
        "ns-mcp-server"
      ],
      "env": {
        "NS_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

You can get an API key from [NS API Portal](https://apiportal.ns.nl/)

### 2. Using Smithery

To install NS Travel Information Server automatically via [Smithery](https://smithery.ai/server/ns-server):

```bash
npx -y @smithery/cli install ns-server --client claude
```

### 3. From Source

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

Then update your Claude configuration file:

```json
{
  "mcpServers": {
    "ns-server": {
      "command": "node",
      "args": [
        "/path/to/ns-server/build/index.js"
      ],
      "env": {
        "NS_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

Make sure to:
1. Replace `/path/to/ns-server` with the actual path to your installation
2. Add your NS API key in the `env` section

After updating the configuration, restart Claude Desktop for the changes to take effect.

## Real-World Use Cases

- "Is my usual 8:15 train from Almere to Amsterdam running on time?"
- "Are there any delays on the Rotterdam-Den Haag route today."
- "What's the best alternative route to Utrecht if there's maintenance on the direct line?"
- "Which train should I take to arrive at my office in Amsterdam Zuid before 9 AM?"
- "Which route to Amsterdam has the fewest transfers with a stroller?"
- "What's the earliest train I can take to make my 10 AM meeting in The Hague?"
- "Is there first class quiet workspace available on the Amsterdam to Rotterdam route?"
- "When's the last train back to Groningen after a night out in Amsterdam?"
- "Are there any weekend engineering works that might affect my Monday morning class?"
- "Are there OV-fiets bikes available at Utrecht Centraal for my afternoon meeting?"
- "Is Eindhoven Strijp-S station wheelchair accessible and what platforms does it have?"

## 🔑 Environment Variables

| Variable | Description |
|----------|-------------|
| NS_API_KEY | Your NS API key (required) |

## 🌟 Features

This MCP server enables Claude to:
- Access real-time departure and arrival information
- Find optimal travel routes across the Netherlands
- Check for service disruptions and engineering works
- Search for detailed station information (facilities, accessibility, tracks)
- Provide platform information and station facilities
- Get pricing information for your journey
- Check OV-fiets (bike rental) availability at stations

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
