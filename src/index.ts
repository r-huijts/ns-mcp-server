import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";

import { Config } from "./config/index.js";
import { NSApiService } from "./services/NSApiService.js";
import { ToolOrchestrator } from "./ai/ToolOrchestrator.js";
import { ResponseFormatter } from "./utils/ResponseFormatter.js";

class NSServer {
  private readonly server: Server;
  private readonly nsApiService: NSApiService;
  private readonly toolOrchestrator: ToolOrchestrator;

  constructor() {
    const config = Config.getInstance();
    this.nsApiService = new NSApiService(config.nsApiKey);
    this.toolOrchestrator = new ToolOrchestrator(this.nsApiService);
    this.server = new Server({ name: config.serverName, version: config.serverVersion });
  }

  private setupErrorHandling(): void {
    this.server.onerror = (error) => {
      console.error("[MCP Error]", error);
    };
  }

  private setupToolHandlers(): void {
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      if (name === "ask_ns") {
        const query = String(args?.query ?? "");
        const result = await this.toolOrchestrator.handle(query);

        // Use ResponseFormatter to respect MCP response size limits and error mapping
        try {
          return ResponseFormatter.formatSuccess({
            intent: result.intent,
            summary: result.summary,
            data: result.data,
          });
        } catch (err) {
          return ResponseFormatter.formatError(err);
        }
      }

      if (name === "ns_info") {
        return ResponseFormatter.formatSuccess({
          name: "NS Travel Information MCP Server",
          version: "1.0.0",
          capabilities: [
            "disruptions",
            "departures",
            "arrivals",
            "prices",
            "travel-advice",
            "station-info",
          ],
        });
      }

      return ResponseFormatter.formatSuccess({ message: `Unknown tool: ${name}` });
    });
  }

  async run(): Promise<void> {
    this.setupErrorHandling();
    this.setupToolHandlers();

    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}

const server = new NSServer();
server.run().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
