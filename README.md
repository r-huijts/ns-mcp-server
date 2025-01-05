# NS Travel Information MCP Server

An MCP server that provides access to NS (Dutch Railways) travel information.

<a href="https://glama.ai/mcp/servers/tzd5oz5tov"><img width="380" height="200" src="https://glama.ai/mcp/servers/tzd5oz5tov/badge" alt="NS Travel Information Server MCP server" /></a>

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


## Integration with Claude Desktop

To add this server to Claude Desktop, update your Claude configuration file (`~/Library/Application Support/Claude/claude_desktop_config.json`) by adding the following to the `mcpServers` object:

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

## Environment Variables

| Variable | Description |
|----------|-------------|
| NS_API_KEY | Your NS API key (required) |

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
