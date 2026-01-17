import axios, { AxiosInstance } from 'axios';

export interface QbittorrentTorrent {
  hash: string;
  name: string;
  magnet_uri?: string;
  size: number;
  progress: number;
  downloaded: number;
  uploaded: number;
  ratio: number;
  upload_rate: number;
  download_rate: number;
  eta: number;
  state: string;
  category: string;
  tags?: string[];
  added_on: number;
  completion_on: number;
  seen_complete: number;
  last_seen: number;
  comment?: string;
  content_path?: string;
  total_wasted?: number;
  total_uploaded?: number;
  total_downloaded?: number;
  up_speed_avg?: number;
  dl_speed_avg?: number;
  time_elapsed?: number;
  seeding_time?: number;
  nb_connections?: number;
  nb_connections_limit?: number;
  peers?: number;
  peers_total?: number;
  seeds?: number;
  seeds_total?: number;
}

export interface QbittorrentCategory {
  name: string;
  savePath: string;
}

export interface QbittorrentConfig {
  url: string;
  username?: string;
  password?: string;
}

export class QbittorrentClient {
  private client: AxiosInstance;
  private baseURL: string;
  private isAuthenticated: boolean = false;

  constructor(config: QbittorrentConfig) {
    this.baseURL = config.url.endsWith('/') ? config.url : config.url + '/';
    
    this.client = axios.create({
      baseURL: this.baseURL + 'api/v2/',
      timeout: 10000,
      withCredentials: true,
    });

    if (config.username && config.password) {
      this.authenticate(config.username, config.password).catch(err => {
        console.error('Erro ao autenticar com qBittorrent:', err);
      });
    }
  }

  private async authenticate(username: string, password: string): Promise<void> {
    try {
      const response = await this.client.post('auth/login', {
        username,
        password,
      });

      if (response.data === 'Ok.') {
        this.isAuthenticated = true;
      }
    } catch (error) {
      console.error('Erro ao autenticar com qBittorrent:', error);
      throw new Error('Falha na autenticação com qBittorrent');
    }
  }

  async listTorrents(filter: string = 'all', category: string = ''): Promise<QbittorrentTorrent[]> {
    try {
      const params: any = { filter };
      if (category) {
        params.category = category;
      }

      const response = await this.client.get('torrents/info', { params });
      return response.data || [];
    } catch (error) {
      console.error('Erro ao listar torrents:', error);
      throw new Error('Falha ao listar torrents');
    }
  }

  async getTorrentDetails(hash: string): Promise<QbittorrentTorrent> {
    try {
      const torrents = await this.listTorrents();
      const torrent = torrents.find(t => t.hash === hash);
      
      if (!torrent) {
        throw new Error('Torrent não encontrado');
      }

      return torrent;
    } catch (error) {
      console.error('Erro ao obter detalhes do torrent:', error);
      throw new Error('Falha ao obter detalhes do torrent');
    }
  }

  async addTorrent(
    torrent: string | Buffer,
    options?: {
      category?: string;
      tags?: string[];
      paused?: boolean;
      savePath?: string;
    }
  ): Promise<void> {
    try {
      const formData = new FormData();
      
      if (typeof torrent === 'string') {
        formData.append('urls', torrent);
      } else {
        const buffer = torrent instanceof Buffer ? (torrent.buffer as unknown as ArrayBuffer) : (torrent as unknown as ArrayBuffer);
        formData.append('torrents', new Blob([buffer]), 'torrent.torrent');
      }

      if (options?.category) {
        formData.append('category', options.category);
      }

      if (options?.tags?.length) {
        formData.append('tags', options.tags.join(','));
      }

      if (options?.paused) {
        formData.append('paused', 'true');
      }

      if (options?.savePath) {
        formData.append('savepath', options.savePath);
      }

      await this.client.post('torrents/add', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } catch (error) {
      console.error('Erro ao adicionar torrent:', error);
      throw new Error('Falha ao adicionar torrent');
    }
  }

  async removeTorrent(hash: string | string[], deleteFiles: boolean = false): Promise<void> {
    try {
      const hashes = Array.isArray(hash) ? hash.join('|') : hash;
      
      await this.client.post('torrents/delete', null, {
        params: {
          hashes,
          deleteFiles,
        },
      });
    } catch (error) {
      console.error('Erro ao remover torrent:', error);
      throw new Error('Falha ao remover torrent');
    }
  }

  async pauseTorrent(hash: string | string[]): Promise<void> {
    try {
      const hashes = Array.isArray(hash) ? hash.join('|') : hash;
      
      await this.client.post('torrents/pause', null, {
        params: { hashes },
      });
    } catch (error) {
      console.error('Erro ao pausar torrent:', error);
      throw new Error('Falha ao pausar torrent');
    }
  }

  async resumeTorrent(hash: string | string[]): Promise<void> {
    try {
      const hashes = Array.isArray(hash) ? hash.join('|') : hash;
      
      await this.client.post('torrents/resume', null, {
        params: { hashes },
      });
    } catch (error) {
      console.error('Erro ao retomar torrent:', error);
      throw new Error('Falha ao retomar torrent');
    }
  }

  async setCategory(hash: string | string[], category: string): Promise<void> {
    try {
      const hashes = Array.isArray(hash) ? hash.join('|') : hash;
      
      await this.client.post('torrents/setCategory', null, {
        params: {
          hashes,
          category,
        },
      });
    } catch (error) {
      console.error('Erro ao definir categoria:', error);
      throw new Error('Falha ao definir categoria');
    }
  }

  async setTags(hash: string | string[], tags: string[]): Promise<void> {
    try {
      const hashes = Array.isArray(hash) ? hash.join('|') : hash;
      
      await this.client.post('torrents/addTags', null, {
        params: {
          hashes,
          tags: tags.join(','),
        },
      });
    } catch (error) {
      console.error('Erro ao definir tags:', error);
      throw new Error('Falha ao definir tags');
    }
  }

  async removeTags(hash: string | string[], tags: string[]): Promise<void> {
    try {
      const hashes = Array.isArray(hash) ? hash.join('|') : hash;
      
      await this.client.post('torrents/removeTags', null, {
        params: {
          hashes,
          tags: tags.join(','),
        },
      });
    } catch (error) {
      console.error('Erro ao remover tags:', error);
      throw new Error('Falha ao remover tags');
    }
  }

  async setSpeedLimit(hash: string | string[], limit: number): Promise<void> {
    try {
      const hashes = Array.isArray(hash) ? hash.join('|') : hash;
      
      await this.client.post('torrents/setDownloadLimit', null, {
        params: {
          hashes,
          limit,
        },
      });
    } catch (error) {
      console.error('Erro ao definir limite de velocidade:', error);
      throw new Error('Falha ao definir limite de velocidade');
    }
  }

  async getCategories(): Promise<Record<string, QbittorrentCategory>> {
    try {
      const response = await this.client.get('torrents/categories');
      return response.data || {};
    } catch (error) {
      console.error('Erro ao obter categorias:', error);
      throw new Error('Falha ao obter categorias');
    }
  }

  async createCategory(name: string, savePath: string): Promise<void> {
    try {
      await this.client.post('torrents/createCategory', null, {
        params: {
          category: name,
          savePath,
        },
      });
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      throw new Error('Falha ao criar categoria');
    }
  }

  async deleteCategory(name: string): Promise<void> {
    try {
      await this.client.post('torrents/removeCategories', null, {
        params: {
          categories: name,
        },
      });
    } catch (error) {
      console.error('Erro ao deletar categoria:', error);
      throw new Error('Falha ao deletar categoria');
    }
  }

  async getServerStats(): Promise<any> {
    try {
      const response = await this.client.get('server/stats');
      return response.data;
    } catch (error) {
      console.error('Erro ao obter estatísticas do servidor:', error);
      throw new Error('Falha ao obter estatísticas');
    }
  }

  async getPreferences(): Promise<any> {
    try {
      const response = await this.client.get('app/preferences');
      return response.data;
    } catch (error) {
      console.error('Erro ao obter preferências:', error);
      throw new Error('Falha ao obter preferências');
    }
  }

  async setPreferences(preferences: Record<string, any>): Promise<void> {
    try {
      await this.client.post('app/setPreferences', { json: JSON.stringify(preferences) });
    } catch (error) {
      console.error('Erro ao definir preferências:', error);
      throw new Error('Falha ao definir preferências');
    }
  }

  async getApplicationVersion(): Promise<string> {
    try {
      const response = await this.client.get('app/webapiVersion');
      return response.data;
    } catch (error) {
      console.error('Erro ao obter versão:', error);
      throw new Error('Falha ao obter versão');
    }
  }

  async shutdown(): Promise<void> {
    try {
      await this.client.post('app/shutdown');
    } catch (error) {
      console.error('Erro ao desligar qBittorrent:', error);
      throw new Error('Falha ao desligar qBittorrent');
    }
  }
}
