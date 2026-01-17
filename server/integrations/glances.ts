import axios, { AxiosInstance } from 'axios';

export interface GlancesCPU {
  total: number;
  user: number;
  system: number;
  idle: number;
  nice: number;
  iowait: number;
  irq: number;
  softirq: number;
  steal: number;
  guest: number;
  guest_nice: number;
  percent: number;
  [key: string]: unknown;
}

export interface GlancesMemory {
  total: number;
  available: number;
  percent: number;
  used: number;
  free: number;
  active: number;
  inactive: number;
  buffers: number;
  cached: number;
  shared: number;
  [key: string]: unknown;
}

export interface GlancesDisk {
  device_name: string;
  fs_type: string;
  mnt_point: string;
  size: number;
  used: number;
  free: number;
  percent: number;
  [key: string]: unknown;
}

export interface GlancesNetwork {
  interface_name: string;
  bytes_sent: number;
  bytes_recv: number;
  packets_sent: number;
  packets_recv: number;
  errin: number;
  errout: number;
  dropin: number;
  dropout: number;
  speed: number;
  mtu: number;
  [key: string]: unknown;
}

export interface GlancesProcess {
  pid: number;
  name: string;
  status: string;
  user: string;
  cpu_percent: number;
  memory_percent: number;
  memory_info: number;
  cpu_num: number;
  num_threads: number;
  [key: string]: unknown;
}

export interface GlancesData {
  cpu: GlancesCPU;
  memory: GlancesMemory;
  disk: GlancesDisk[];
  network: GlancesNetwork[];
  processes: GlancesProcess[];
  [key: string]: unknown;
}

export class GlancesClient {
  private client: AxiosInstance;
  private baseUrl: string;
  private apiKey?: string;

  constructor(baseUrl: string, apiKey?: string) {
    // Remove protocol if present
    let url = baseUrl.replace(/^https?:\/\//i, '');
    // Remove trailing slash
    url = url.replace(/\/$/, '');
    
    // Add protocol
    const normalizedUrl = `http://${url}`;

    this.baseUrl = normalizedUrl.replace(/\/$/, '');
    this.apiKey = apiKey;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    if (apiKey) {
      headers['X-API-KEY'] = apiKey;
    }

    this.client = axios.create({
      baseURL: this.baseUrl,
      headers,
      timeout: 10000,
    });
  }

  async getStatus(): Promise<boolean> {
    try {
      const response = await this.client.get('/api/3/status');
      return response.status === 200;
    } catch (error) {
      console.error('Erro ao verificar status do Glances:', error);
      return false;
    }
  }

  async getAllData(): Promise<GlancesData> {
    try {
      const response = await this.client.get('/api/3/all');
      if (response.status !== 200) {
        throw new Error(`Erro ao obter dados: ${response.status}`);
      }
      return response.data;
    } catch (error) {
      console.error('Erro ao obter todos os dados:', error);
      throw new Error(`Falha ao obter dados: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async getCPU(): Promise<GlancesCPU> {
    try {
      const response = await this.client.get('/api/3/cpu');
      if (response.status !== 200) {
        throw new Error(`Erro ao obter CPU: ${response.status}`);
      }
      return response.data;
    } catch (error) {
      console.error('Erro ao obter CPU:', error);
      throw new Error(`Falha ao obter CPU: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async getMemory(): Promise<GlancesMemory> {
    try {
      const response = await this.client.get('/api/3/mem');
      if (response.status !== 200) {
        throw new Error(`Erro ao obter memória: ${response.status}`);
      }
      return response.data;
    } catch (error) {
      console.error('Erro ao obter memória:', error);
      throw new Error(`Falha ao obter memória: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async getDisks(): Promise<GlancesDisk[]> {
    try {
      const response = await this.client.get('/api/3/disks');
      if (response.status !== 200) {
        throw new Error(`Erro ao obter discos: ${response.status}`);
      }
      return response.data;
    } catch (error) {
      console.error('Erro ao obter discos:', error);
      throw new Error(`Falha ao obter discos: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async getNetwork(): Promise<GlancesNetwork[]> {
    try {
      const response = await this.client.get('/api/3/network');
      if (response.status !== 200) {
        throw new Error(`Erro ao obter rede: ${response.status}`);
      }
      return response.data;
    } catch (error) {
      console.error('Erro ao obter rede:', error);
      throw new Error(`Falha ao obter rede: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async getProcesses(limit = 10): Promise<GlancesProcess[]> {
    try {
      const response = await this.client.get('/api/3/processlist', {
        params: { limit },
      });
      if (response.status !== 200) {
        throw new Error(`Erro ao obter processos: ${response.status}`);
      }
      return response.data;
    } catch (error) {
      console.error('Erro ao obter processos:', error);
      throw new Error(`Falha ao obter processos: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async getProcessesSorted(
    sortBy: 'cpu_percent' | 'memory_percent' = 'cpu_percent',
    limit = 10
  ): Promise<GlancesProcess[]> {
    try {
      const response = await this.client.get('/api/3/processlist', {
        params: {
          sort: sortBy,
          limit,
        },
      });
      if (response.status !== 200) {
        throw new Error(`Erro ao obter processos ordenados: ${response.status}`);
      }
      return response.data;
    } catch (error) {
      console.error('Erro ao obter processos ordenados:', error);
      throw new Error(`Falha ao obter processos: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.client.get('/api/3/status');

      if (response.status === 200) {
        return {
          success: true,
          message: 'Conexão estabelecida com sucesso',
        };
      }

      return {
        success: false,
        message: `Erro ao conectar: ${response.status}`,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';

      if (errorMessage.includes('ECONNREFUSED')) {
        return {
          success: false,
          message: 'Não foi possível conectar. Verifique a URL do Glances.',
        };
      }

      if (errorMessage.includes('ENOTFOUND')) {
        return {
          success: false,
          message: 'Domínio não encontrado. Verifique a URL.',
        };
      }

      if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
        return {
          success: false,
          message: 'Chave de API inválida ou não autorizado.',
        };
      }

      if (errorMessage.includes('404')) {
        return {
          success: false,
          message: 'API do Glances não encontrada. Verifique a URL e versão do Glances.',
        };
      }

      return {
        success: false,
        message: `Erro ao conectar: ${errorMessage}`,
      };
    }
  }
}
