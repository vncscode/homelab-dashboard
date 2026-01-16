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
    this.baseUrl = baseUrl.replace(/\/$/, '');
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
    });
  }

  async getStatus(): Promise<boolean> {
    try {
      await this.client.get('/api/3/status');
      return true;
    } catch {
      return false;
    }
  }

  async getAllData(): Promise<GlancesData> {
    const response = await this.client.get('/api/3/all');
    return response.data;
  }

  async getCPU(): Promise<GlancesCPU> {
    const response = await this.client.get('/api/3/cpu');
    return response.data;
  }

  async getMemory(): Promise<GlancesMemory> {
    const response = await this.client.get('/api/3/mem');
    return response.data;
  }

  async getDisks(): Promise<GlancesDisk[]> {
    const response = await this.client.get('/api/3/disks');
    return response.data;
  }

  async getNetwork(): Promise<GlancesNetwork[]> {
    const response = await this.client.get('/api/3/network');
    return response.data;
  }

  async getProcesses(limit = 10): Promise<GlancesProcess[]> {
    const response = await this.client.get('/api/3/processlist', {
      params: { limit },
    });
    return response.data;
  }

  async getProcessesSorted(
    sortBy: 'cpu_percent' | 'memory_percent' = 'cpu_percent',
    limit = 10
  ): Promise<GlancesProcess[]> {
    const response = await this.client.get('/api/3/processlist', {
      params: {
        sort: sortBy,
        limit,
      },
    });
    return response.data;
  }
}
