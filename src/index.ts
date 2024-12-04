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
import { TravelAdvice, GetTravelAdviceArgs, isValidTravelAdviceArgs } from './types.js';

// Load environment variables from .env file
dotenv.config();

// Ensure NS API key is available
const NS_API_KEY = process.env.NS_API_KEY;
if (!NS_API_KEY) {
  throw new Error('NS_API_KEY environment variable is required');
}

// API configuration for NS endpoints
const API_CONFIG = {
  BASE_URL: 'https://gateway.apiportal.ns.nl',
  ENDPOINTS: {
    DISRUPTIONS: '/disruptions/v3',
    TRIPS: '/reisinformatie-api/api/v3/trips'
  }
} as const;

/**
 * MCP Server implementation for NS (Dutch Railways) API
 * Provides tools for:
 * - Getting travel advice between stations
 * - Checking current disruptions
 */
class DisruptionsServer {
  private server: Server;
  private axiosInstance;

  constructor() {
    // Initialize MCP server with basic configuration
    this.server = new Server(
      { name: 'ns-disruptions-server', version: '1.0.0' },
      { capabilities: { tools: {} } }
    );

    // Configure axios instance with NS API authentication
    this.axiosInstance = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      headers: {
        'Ocp-Apim-Subscription-Key': NS_API_KEY,
      },
    });

    this.setupHandlers();
    this.setupErrorHandling();
  }

  /**
   * Set up error handling for the MCP server
   * Handles SIGINT for graceful shutdown
   */
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

  /**
   * Configure available tools and their handlers
   * Implements:
   * - get_disruptions: Fetch current train disruptions
   * - get_travel_advice: Get travel recommendations between stations
   */
  private setupToolHandlers(): void {
    // Register available tools with their schemas
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
        {
          name: 'get_travel_advice',
          description: 'Get travel advice between two train stations',
          inputSchema: {
            type: 'object',
            properties: {
              fromStation: {
                type: 'string',
                description: 'Name or code of departure station',
              },
              toStation: {
                type: 'string',
                description: 'Name or code of destination station',
              },
              dateTime: {
                type: 'string',
                description: 'Optional departure/arrival time in ISO format (e.g. 2024-03-20T14:00:00+01:00)',
              },
              searchForArrival: {
                type: 'boolean',
                description: 'If true, dateTime is treated as desired arrival time instead of departure time',
              },
            },
            required: ['fromStation', 'toStation'],
          },
        },
      ],
    }));

    // Handle tool execution requests
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const rawArgs = request.params.arguments || {};

      switch (request.params.name) {
        case 'get_disruptions': {
          // Parse and validate disruptions request arguments
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
            // Call NS API to get disruptions
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
              return {
                isError: true,
                content: [{
                  type: "text",
                  text: `NS API error: ${error.response?.data?.message || error.message || 'Unknown error'}`
                }]
              };
            }
            throw error;
          }
        }

        case 'get_travel_advice': {
          // Parse and validate travel advice request arguments
          const args: GetTravelAdviceArgs = {
            fromStation: String(rawArgs.fromStation || ''),
            toStation: String(rawArgs.toStation || ''),
            dateTime: rawArgs.dateTime as string | undefined,
            searchForArrival: rawArgs.searchForArrival === true,
          };

          if (!isValidTravelAdviceArgs(args)) {
            throw new McpError(
              ErrorCode.InvalidParams,
              `Invalid arguments for get_travel_advice. Expected {fromStation: string, toStation: string, dateTime?: string, searchForArrival?: boolean}`
            );
          }

          try {
            // Call NS API to get travel advice
            const response = await this.axiosInstance.get<TravelAdvice[]>(
              API_CONFIG.ENDPOINTS.TRIPS,
              {
                params: {
                  fromStation: args.fromStation,
                  toStation: args.toStation,
                  dateTime: args.dateTime,
                  searchForArrival: args.searchForArrival,
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
              return {
                isError: true,
                content: [{
                  type: "text",
                  text: `NS API error: ${error.response?.data?.message || error.message || 'Unknown error'}`
                }]
              };
            }
            throw error;
          }
        }

        default:
          throw new McpError(
            ErrorCode.MethodNotFound,
            `Unknown tool: ${request.params.name}`
          );
      }
    });
  }

  /**
   * Start the MCP server using stdio transport
   */
  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}

// Create and start the server
const server = new DisruptionsServer();
server.run().catch(console.error);