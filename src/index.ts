#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  ErrorCode,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';
import dotenv from 'dotenv';
import { Disruption, GetDisruptionsArgs, isValidDisruptionsArgs } from './types.js';

dotenv.config();

const NS_API_KEY = process.env.NS_API_KEY;

if (!NS_API_KEY) {
  throw new Error('NS_API_KEY environment variable is required');
}

const API_CONFIG = {
  BASE_URL: 'https://gateway.apiportal.ns.nl/disruptions/v3',
  ENDPOINTS: {
    DISRUPTIONS: ''
  }
} as const;

class DisruptionsServer {
  private server: Server;
  private axiosInstance;

  constructor() {
    this.server = new Server(
      { name: 'ns-disruptions-server', version: '1.0.0' },
      { capabilities: { tools: {} } }
    );

    this.axiosInstance = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      headers: {
        'Ocp-Apim-Subscription-Key': NS_API_KEY,
      },
    });

    this.setupHandlers();
    this.setupErrorHandling();
  }

  private setupErrorHandling(): void {
    this.server.onerror = (error) => {
      console.error('[MCP Error]', error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupHandlers(): void {
    this.setupToolHandlers();
  }

  private setupToolHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'get_disruptions',
          description: 'Get current train disruptions from NS API',
          inputSchema: {
            type: 'object',
            properties: {
              isActive: {
                type: 'boolean',
                description: 'Filter to only return active disruptions',
              },
              type: {
                type: 'string',
                description: 'Type of disruptions to return (e.g., MAINTENANCE, DISRUPTION)',
                enum: ['MAINTENANCE', 'DISRUPTION']
              },
            },
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      if (request.params.name !== 'get_disruptions') {
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${request.params.name}`
        );
      }

      const rawArgs = request.params.arguments || {};
      const args: GetDisruptionsArgs = {
        isActive: true,
        ...rawArgs,
        ...(rawArgs.isActive !== undefined && {
          isActive: String(rawArgs.isActive).toLowerCase() === 'true'
        })
      };

      if (!isValidDisruptionsArgs(args)) {
        throw new McpError(
          ErrorCode.InvalidParams,
          `${JSON.stringify(request.params.arguments)} Invalid arguments for get_disruptions. Expected {isActive?: boolean, type?: "MAINTENANCE" | "DISRUPTION"}`
        );
      }

      try {
        const response = await this.axiosInstance.get<Disruption[]>(
          API_CONFIG.ENDPOINTS.DISRUPTIONS,
          {
            params: {
              isActive: args.isActive,
              type: args.type,
            },
          }
        );

        return {
          content: [{
            type: "text",
            text: JSON.stringify(response.data, null, 2)
          }]
        };
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw new McpError(
            ErrorCode.InternalError,
            `NS API error: ${error.response?.data.message ?? error.message}`
          );
        }
        throw error;
      }
    });
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}

const server = new DisruptionsServer();
server.run().catch(console.error);