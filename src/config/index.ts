import dotenv from 'dotenv';

export class Config {
  private static instance: Config;
  private readonly config: {
    NS_API_KEY: string;
    SERVER_NAME: string;
    SERVER_VERSION: string;
  };

  private constructor() {
    dotenv.config();

    const NS_API_KEY = process.env.NS_API_KEY;
    if (!NS_API_KEY) {
      throw new Error('NS_API_KEY environment variable is required');
    }

    this.config = {
      NS_API_KEY,
      SERVER_NAME: 'ns-disruptions-server',
      SERVER_VERSION: '1.0.0'
    };
  }

  static getInstance(): Config {
    if (!Config.instance) {
      Config.instance = new Config();
    }
    return Config.instance;
  }

  get nsApiKey(): string {
    return this.config.NS_API_KEY;
  }

  get serverName(): string {
    return this.config.SERVER_NAME;
  }

  get serverVersion(): string {
    return this.config.SERVER_VERSION;
  }
} 