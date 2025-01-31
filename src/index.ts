#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  ErrorCode,
} from '@modelcontextprotocol/sdk/types.js';
import { Config } from './config/index.js';
import { NSApiService } from './services/NSApiService.js';
import { ResponseFormatter } from './utils/ResponseFormatter.js';
import { isValidDisruptionsArgs, isValidTravelAdviceArgs, isValidDeparturesArgs, isValidOVFietsArgs, isValidStationInfoArgs } from './types.js';

class DisruptionsServer {
  private server: Server;
  private nsApiService: NSApiService;

  constructor() {
    const config = Config.getInstance();
    
    this.server = new Server(
      { 
        name: config.serverName, 
        version: config.serverVersion 
      },
      { capabilities: { tools: {} } }
    );

    this.nsApiService = new NSApiService(config.nsApiKey);
    
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
                description: 'Optional departure/arrival time in ISO format',
              },
              searchForArrival: {
                type: 'boolean',
                description: 'If true, dateTime is treated as desired arrival time',
              },
            },
            required: ['fromStation', 'toStation'],
          },
        },
        {
          name: 'get_departures',
          description: 'Get list of departing trains from a station',
          inputSchema: {
            type: 'object',
            properties: {
              station: {
                type: 'string',
                description: 'Station name or code to get departures for',
              },
              dateTime: {
                type: 'string',
                description: 'Optional departure time in ISO format',
              },
              maxJourneys: {
                type: 'number',
                description: 'Maximum number of departures to return (default: 40)',
                minimum: 1,
                maximum: 100
              },
              lang: {
                type: 'string',
                description: 'Language for messages (default: nl)',
                enum: ['nl', 'en']
              }
            },
            required: ['station']
          }
        },
        {
          name: 'get_ovfiets',
          description: 'Get OV-fiets availability at a train station',
          inputSchema: {
            type: 'object',
            properties: {
              stationCode: {
                type: 'string',
                description: 'Station code to check OV-fiets availability for (e.g., ASD for Amsterdam Centraal)',
              }
            },
            required: ['stationCode']
          }
        },
        {
          name: 'get_station_info',
          description: 'Get detailed information about a train station',
          inputSchema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'Station name or code to search for',
              },
              includeNonPlannableStations: {
                type: 'boolean',
                description: 'Include stations where trains do not stop regularly',
                default: false
              },
              limit: {
                type: 'number',
                description: 'Maximum number of results to return',
                minimum: 1,
                maximum: 50,
                default: 10
              }
            },
            required: ['query']
          }
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const rawArgs = request.params.arguments || {};

      try {
        switch (request.params.name) {
          case 'get_disruptions': {
            if (!isValidDisruptionsArgs(rawArgs)) {
              throw ResponseFormatter.createMcpError(
                ErrorCode.InvalidParams,
                'Invalid arguments for get_disruptions'
              );
            }
            const data = await this.nsApiService.getDisruptions(rawArgs);
            return ResponseFormatter.formatSuccess(data);
          }

          case 'get_travel_advice': {
            if (!isValidTravelAdviceArgs(rawArgs)) {
              throw ResponseFormatter.createMcpError(
                ErrorCode.InvalidParams,
                'Invalid arguments for get_travel_advice'
              );
            }
            const data = await this.nsApiService.getTravelAdvice(rawArgs);
            return ResponseFormatter.formatSuccess(data);
          }

          case 'get_departures': {
            if (!isValidDeparturesArgs(rawArgs)) {
              throw ResponseFormatter.createMcpError(
                ErrorCode.InvalidParams,
                'Invalid arguments for get_departures'
              );
            }
            const data = await this.nsApiService.getDepartures(rawArgs);
            return ResponseFormatter.formatSuccess(data);
          }

          case 'get_ovfiets': {
            if (!isValidOVFietsArgs(rawArgs)) {
              throw ResponseFormatter.createMcpError(
                ErrorCode.InvalidParams,
                'Invalid arguments for get_ovfiets'
              );
            }
            const data = await this.nsApiService.getOVFiets(rawArgs);
            return ResponseFormatter.formatSuccess(data);
          }

          case 'get_station_info': {
            if (!isValidStationInfoArgs(rawArgs)) {
              throw ResponseFormatter.createMcpError(
                ErrorCode.InvalidParams,
                'Invalid arguments for get_station_info'
              );
            }
            const data = await this.nsApiService.getStationInfo(rawArgs);
            return ResponseFormatter.formatSuccess(data);
          }

          default:
            throw ResponseFormatter.createMcpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${request.params.name}`
            );
        }
      } catch (error) {
        return ResponseFormatter.formatError(error);
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