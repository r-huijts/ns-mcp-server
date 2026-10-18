import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import { AxiosError } from 'axios';

export class ResponseFormatter {
  static formatSuccess(data: unknown) {
    const payload = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
    const maxLength = Number(process.env.MCP_RESPONSE_MAX_CHARS ?? 20000);
    const text = payload.length > maxLength ? `${payload.slice(0, maxLength)}\n... (truncated)` : payload;

    return {
      content: [{
        type: 'text',
        text,
      }],
    };
  }

  static formatError(error: unknown) {
    if (error instanceof McpError) {
      return {
        isError: true,
        content: [{
          type: 'text',
          text: error.message,
        }],
      };
    }

    if (error instanceof AxiosError) {
      return {
        isError: true,
        content: [{
          type: 'text',
          text: `NS API error: ${error.response?.data?.message || error.message || 'Unknown error'}`,
        }],
      };
    }

    return {
      isError: true,
      content: [{
        type: 'text',
        text: error instanceof Error ? error.message : 'Unknown error occurred',
      }],
    };
  }

  static createMcpError(code: ErrorCode, message: string): McpError {
    return new McpError(code, message);
  }
}
