import axios, { AxiosInstance } from 'axios';
import type { Readable } from 'stream';

export interface JexactylConsoleMessage {
  line: string;
  timestamp: number;
}

export interface JexactylServer {
  object: string;
  attributes: {
    id: string;
    uuid: string;
    name: string;
    status: string;
    [key: string]: unknown;
  };
}

export interface JexactylFile {
  object: string;
  attributes: {
    name: string;
    mode: string;
    size: number;
    is_file: boolean;
    is_symlink: boolean;
    is_directory: boolean;
    [key: string]: unknown;
  };
}

export class JexactylClient {
  private client: AxiosInstance;
  private baseUrl: string;
  private apiKey: string;
  private serverId: string;

  constructor(baseUrl: string, apiKey: string, serverId: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
    this.serverId = serverId;

    this.client = axios.create({
      baseURL: baseUrl,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });
  }

  async getServerDetails(): Promise<JexactylServer> {
    const response = await this.client.get(`/api/client/servers/${this.serverId}`);
    return response.data;
  }

  async sendCommand(command: string): Promise<void> {
    await this.client.post(`/api/client/servers/${this.serverId}/command`, {
      command,
    });
  }

  async startServer(): Promise<void> {
    await this.sendCommand('start');
  }

  async stopServer(): Promise<void> {
    await this.sendCommand('stop');
  }

  async restartServer(): Promise<void> {
    await this.sendCommand('restart');
  }

  async getFiles(directory: string = '/'): Promise<JexactylFile[]> {
    const response = await this.client.get(
      `/api/client/servers/${this.serverId}/files/list`,
      {
        params: { directory },
      }
    );
    return response.data.data;
  }

  async getFileContents(filePath: string): Promise<string> {
    const response = await this.client.get(
      `/api/client/servers/${this.serverId}/files/contents`,
      {
        params: { file: filePath },
      }
    );
    return response.data;
  }

  async writeFileContents(filePath: string, contents: string): Promise<void> {
    await this.client.post(
      `/api/client/servers/${this.serverId}/files/write`,
      {
        file: filePath,
        content: contents,
      }
    );
  }

  async deleteFile(filePath: string): Promise<void> {
    await this.client.post(
      `/api/client/servers/${this.serverId}/files/delete`,
      {
        root: '/',
        files: [filePath],
      }
    );
  }

  async createFolder(folderPath: string): Promise<void> {
    await this.client.post(
      `/api/client/servers/${this.serverId}/files/create-folder`,
      {
        root: '/',
        folder: folderPath,
      }
    );
  }

  async uploadFile(filePath: string, fileBuffer: Uint8Array | string): Promise<void> {
    const formData = new FormData();
    formData.append('files', new Blob([fileBuffer as unknown as ArrayBuffer]));

    await this.client.post(
      `/api/client/servers/${this.serverId}/files/upload?directory=${encodeURIComponent(filePath)}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
  }
}
