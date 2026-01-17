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
    // Remove protocol if present
    let domain = config.domain.replace(/^https?:\/\//i, '');
    this.domain = domain;
    this.apiToken = config.apiToken;
    this.baseURL = `https://${domain}/api/client`;
    
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

  /**
   * Get all servers from Jexactyl, handling pagination
   */
  async getAllServers(): Promise<JexactylServer[]> {
    try {
      const allServers: JexactylServer[] = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const { servers, pagination } = await this.getServers(page);
        allServers.push(...servers);

        // Check if there are more pages
        if (pagination.current_page && pagination.total_pages) {
          hasMore = pagination.current_page < pagination.total_pages;
          page++;
        } else {
          hasMore = false;
        }
      }

      return allServers;
    } catch (error) {
      console.error('Error fetching all servers:', error);
      throw new Error(`Falha ao listar todos os servidores: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
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

  /**
   * Test connection to Jexactyl API
   * Validates domain and API token by attempting to fetch servers
   */
  private async detectEndpoint(): Promise<string | null> {
    // Try different possible endpoints
    const possibleEndpoints = [
      '/servers',
      '/api/servers',
      '/api/client/servers',
      '/jexactyl/api/client/servers',
    ];

    for (const endpoint of possibleEndpoints) {
      try {
        const response = await this.client.get(endpoint, {
          params: { per_page: 1 },
          timeout: 3000,
        });
        if (response.status === 200) {
          console.log(`[Jexactyl] Endpoint detectado: ${endpoint}`);
          return endpoint;
        }
      } catch (error) {
        // Continue to next endpoint
      }
    }
    return null;
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      console.log(`[Jexactyl] Testando conexão com: ${this.baseURL}`);
      
      // Try to detect correct endpoint
      const endpoint = await this.detectEndpoint();
      if (!endpoint) {
        return {
          success: false,
          message: 'Não foi possível encontrar o endpoint do Jexactyl. Verifique se a URL está correta e o Jexactyl está rodando.',
        };
      }
      
      const response = await this.client.get(endpoint, {
        params: { per_page: 1 },
      });
      
      if (response.status === 200) {
        return {
          success: true,
          message: 'Conexao estabelecida com sucesso',
        };
      }
      
      return {
        success: false,
        message: 'Resposta inesperada do servidor',
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      const errorCode = (error as any)?.code || 'UNKNOWN';
      
      console.error(`[Jexactyl] Erro ao conectar: ${errorCode} - ${errorMessage}`);
      console.error(`[Jexactyl] URL tentada: ${this.baseURL}`);
      
      if (errorCode === 'ECONNREFUSED' || errorMessage.includes('ECONNREFUSED')) {
        return {
          success: false,
          message: 'Conexão recusada. O servidor pode estar offline ou a porta está incorreta.',
        };
      }
      
      if (errorCode === 'ENOTFOUND' || errorMessage.includes('ENOTFOUND')) {
        return {
          success: false,
          message: `Dominio nao encontrado: ${this.domain}. Verifique se o dominio esta correto e acessivel.`,
        };
      }
      
      if (errorCode === 'ETIMEDOUT' || errorMessage.includes('timeout')) {
        return {
          success: false,
          message: 'Timeout na conexão. O servidor está demorando muito para responder.',
        };
      }
      
      if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
        return {
          success: false,
          message: 'Chave de API invalida. Verifique suas credenciais.',
        };
      }
      
      if (errorMessage.includes('404')) {
        return {
          success: false,
          message: 'Endpoint nao encontrado. O Jexactyl pode estar em um subpath diferente ou usar uma versão diferente da API.',
        };
      }
      
      if (errorMessage.includes('403') || errorMessage.includes('Forbidden')) {
        return {
          success: false,
          message: 'Acesso negado. Verifique suas permissoes e credenciais.',
        };
      }
      
      return {
        success: false,
        message: `Erro ao conectar (${errorCode}): ${errorMessage}`,
      };
    }
  }
}
