import axios, { AxiosInstance } from 'axios';

export interface JexactylServer {
  object: string;
  attributes: {
    server_owner: boolean;
    identifier: string;
    uuid: string;
    name: string;
    node: string;
    description: string;
    status: string | null;
    is_suspended: boolean;
    is_installing: boolean;
    is_transferring: boolean;
  };
}

export interface JexactylServerStats {
  object: string;
  attributes: {
    current_state: string;
    is_suspended: boolean;
    resources: {
      memory_bytes: number;
      memory_limit_bytes: number;
      cpu_absolute: number;
      network: {
        rx_bytes: number;
        tx_bytes: number;
      };
      disk_bytes: number;
    };
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
  };
}

export interface JexactylConfig {
  domain: string;
  apiToken: string;
}

export class JexactylClient {
  private domain: string;
  private apiToken: string;
  private baseURL: string;
  private client: AxiosInstance;

  constructor(config: JexactylConfig) {
    this.domain = config.domain;
    this.apiToken = config.apiToken;
    this.baseURL = `https://${this.domain}/api/client`;
    
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: this.getHeaders(),
      timeout: 10000,
    });
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.apiToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  async getServers(page: number = 1): Promise<{ servers: JexactylServer[]; pagination: any }> {
    try {
      const response = await this.client.get('/servers', {
        params: { page, per_page: 50 },
      });
      return {
        servers: response.data.data || [],
        pagination: response.data.meta?.pagination || {},
      };
    } catch (error) {
      console.error('Error fetching servers:', error);
      throw new Error(`Falha ao listar servidores: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async getServerDetails(serverId: string): Promise<JexactylServer> {
    try {
      const response = await this.client.get(`/servers/${serverId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching server details:', error);
      throw new Error(`Falha ao obter detalhes do servidor`);
    }
  }

  async getServerStats(serverId: string): Promise<JexactylServerStats> {
    try {
      const response = await this.client.get(`/servers/${serverId}/resources`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching server stats:', error);
      throw new Error(`Falha ao obter estatisticas`);
    }
  }

  async sendCommand(serverId: string, command: 'start' | 'stop' | 'restart' | 'kill'): Promise<void> {
    try {
      await this.client.post(`/servers/${serverId}/command`, { command });
    } catch (error) {
      console.error('Error sending command:', error);
      throw new Error(`Falha ao enviar comando`);
    }
  }

  async startServer(serverId: string): Promise<void> {
    return this.sendCommand(serverId, 'start');
  }

  async stopServer(serverId: string): Promise<void> {
    return this.sendCommand(serverId, 'stop');
  }

  async restartServer(serverId: string): Promise<void> {
    return this.sendCommand(serverId, 'restart');
  }

  async killServer(serverId: string): Promise<void> {
    return this.sendCommand(serverId, 'kill');
  }

  async listFiles(serverId: string, directory: string = '/'): Promise<JexactylFile[]> {
    try {
      const response = await this.client.get(`/servers/${serverId}/files/list`, {
        params: { directory },
      });
      return response.data.data || [];
    } catch (error) {
      console.error('Error listing files:', error);
      throw new Error(`Falha ao listar arquivos`);
    }
  }

  async getFileDownloadUrl(serverId: string, filePath: string): Promise<string> {
    try {
      const response = await this.client.get(`/servers/${serverId}/files/download`, {
        params: { file: filePath },
      });
      return response.data.attributes?.url || '';
    } catch (error) {
      console.error('Error getting download URL:', error);
      throw new Error(`Falha ao obter URL de download`);
    }
  }

  async getFileContents(serverId: string, filePath: string): Promise<string> {
    try {
      const response = await this.client.get(`/servers/${serverId}/files/contents`, {
        params: { file: filePath },
      });
      return response.data;
    } catch (error) {
      console.error('Error getting file contents:', error);
      throw new Error(`Falha ao obter conteudo do arquivo`);
    }
  }

  async writeFileContents(serverId: string, filePath: string, contents: string): Promise<void> {
    try {
      await this.client.post(`/servers/${serverId}/files/write`, {
        file: filePath,
        content: contents,
      });
    } catch (error) {
      console.error('Error writing file:', error);
      throw new Error(`Falha ao escrever arquivo`);
    }
  }

  async renameFile(serverId: string, oldPath: string, newPath: string): Promise<void> {
    try {
      await this.client.post(`/servers/${serverId}/files/rename`, {
        root: '/',
        files: [{ from: oldPath, to: newPath }],
      });
    } catch (error) {
      console.error('Error renaming file:', error);
      throw new Error(`Falha ao renomear arquivo`);
    }
  }

  async deleteFile(serverId: string, filePath: string): Promise<void> {
    try {
      await this.client.post(`/servers/${serverId}/files/delete`, {
        root: '/',
        files: [filePath],
      });
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new Error(`Falha ao deletar arquivo`);
    }
  }

  async createFolder(serverId: string, folderPath: string): Promise<void> {
    try {
      await this.client.post(`/servers/${serverId}/files/create-folder`, {
        root: '/',
        folder: folderPath,
      });
    } catch (error) {
      console.error('Error creating folder:', error);
      throw new Error(`Falha ao criar pasta`);
    }
  }
}
