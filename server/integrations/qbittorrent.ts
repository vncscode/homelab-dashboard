import axios, { AxiosInstance } from 'axios';
import FormData from 'form-data';
import fs from 'fs';

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
  private username?: string;
  private password?: string;

  constructor(config: QbittorrentConfig) {
    // Remove protocol if present and normalize URL
    let url = config.url.replace(/^https?:\/\//i, '');
    this.baseURL = `http://${url}${url.endsWith('/') ? '' : '/'}`;
    this.username = config.username;
    this.password = config.password;
    
    this.client = axios.create({
      baseURL: this.baseURL + 'api/v2/',
      timeout: 10000,
      validateStatus: () => true, // Don't throw on any status code
    });

    // Add interceptor to handle authentication
    this.client.interceptors.response.use(
      response => {
        if (response.status === 403) {
          // Try to re-authenticate
          this.authenticate(config.username || '', config.password || '').catch(err => {
            console.error('Erro ao re-autenticar com qBittorrent:', err);
          });
        }
        return response;
      },
      error => Promise.reject(error)
    );
  }

  private async authenticate(username: string, password: string): Promise<void> {
    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);

      const response = await this.client.post('auth/login', formData, {
        headers: formData.getHeaders(),
      });

      if (response.status === 200 && response.data === 'Ok.') {
        this.isAuthenticated = true;
      } else if (response.status === 403) {
        throw new Error('Credenciais inválidas');
      } else {
        throw new Error(`Erro ao autenticar: ${response.status}`);
      }
    } catch (error) {
      console.error('Erro ao autenticar com qBittorrent:', error);
      throw new Error('Falha na autenticação com qBittorrent');
    }
  }

  async ensureAuthenticated(): Promise<void> {
    if (!this.isAuthenticated && this.username && this.password) {
      await this.authenticate(this.username, this.password);
    }
  }

  async listTorrents(filter: string = 'all', category: string = ''): Promise<QbittorrentTorrent[]> {
    try {
      await this.ensureAuthenticated();
      
      const params: any = { filter };
      if (category) {
        params.category = category;
      }

      const response = await this.client.get('torrents/info', { params });
      
      if (response.status === 200) {
        return response.data || [];
      } else if (response.status === 403) {
        throw new Error('Não autorizado. Verifique suas credenciais.');
      }
      
      throw new Error(`Erro ao listar torrents: ${response.status}`);
    } catch (error) {
      console.error('Erro ao listar torrents:', error);
      throw new Error(`Falha ao listar torrents: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
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
      await this.ensureAuthenticated();
      
      const formData = new FormData();
      
      if (typeof torrent === 'string') {
        // Check if it's a URL or magnet link
        if (torrent.startsWith('http') || torrent.startsWith('magnet:')) {
          formData.append('urls', torrent);
        } else {
          // Assume it's a file path
          formData.append('torrents', fs.createReadStream(torrent));
        }
      } else {
        // It's a Buffer
        formData.append('torrents', torrent, 'torrent.torrent');
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

      const response = await this.client.post('torrents/add', formData, {
        headers: formData.getHeaders(),
      });

      if (response.status !== 200) {
        throw new Error(`Erro ao adicionar torrent: ${response.status}`);
      }
    } catch (error) {
      console.error('Erro ao adicionar torrent:', error);
      throw new Error(`Falha ao adicionar torrent: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async removeTorrent(hash: string | string[], deleteFiles: boolean = false): Promise<void> {
    try {
      await this.ensureAuthenticated();
      
      const hashes = Array.isArray(hash) ? hash.join('|') : hash;
      
      const response = await this.client.post('torrents/delete', null, {
        params: {
          hashes,
          deleteFiles,
        },
      });

      if (response.status !== 200) {
        throw new Error(`Erro ao remover torrent: ${response.status}`);
      }
    } catch (error) {
      console.error('Erro ao remover torrent:', error);
      throw new Error('Falha ao remover torrent');
    }
  }

  async pauseTorrent(hash: string | string[]): Promise<void> {
    try {
      await this.ensureAuthenticated();
      
      const hashes = Array.isArray(hash) ? hash.join('|') : hash;
      
      const response = await this.client.post('torrents/pause', null, {
        params: { hashes },
      });

      if (response.status !== 200) {
        throw new Error(`Erro ao pausar torrent: ${response.status}`);
      }
    } catch (error) {
      console.error('Erro ao pausar torrent:', error);
      throw new Error('Falha ao pausar torrent');
    }
  }

  async resumeTorrent(hash: string | string[]): Promise<void> {
    try {
      await this.ensureAuthenticated();
      
      const hashes = Array.isArray(hash) ? hash.join('|') : hash;
      
      const response = await this.client.post('torrents/resume', null, {
        params: { hashes },
      });

      if (response.status !== 200) {
        throw new Error(`Erro ao retomar torrent: ${response.status}`);
      }
    } catch (error) {
      console.error('Erro ao retomar torrent:', error);
      throw new Error('Falha ao retomar torrent');
    }
  }

  async setCategory(hash: string | string[], category: string): Promise<void> {
    try {
      await this.ensureAuthenticated();
      
      const hashes = Array.isArray(hash) ? hash.join('|') : hash;
      
      const response = await this.client.post('torrents/setCategory', null, {
        params: {
          hashes,
          category,
        },
      });

      if (response.status !== 200) {
        throw new Error(`Erro ao definir categoria: ${response.status}`);
      }
    } catch (error) {
      console.error('Erro ao definir categoria:', error);
      throw new Error('Falha ao definir categoria');
    }
  }

  async setTags(hash: string | string[], tags: string[]): Promise<void> {
    try {
      await this.ensureAuthenticated();
      
      const hashes = Array.isArray(hash) ? hash.join('|') : hash;
      
      const response = await this.client.post('torrents/addTags', null, {
        params: {
          hashes,
          tags: tags.join(','),
        },
      });

      if (response.status !== 200) {
        throw new Error(`Erro ao definir tags: ${response.status}`);
      }
    } catch (error) {
      console.error('Erro ao definir tags:', error);
      throw new Error('Falha ao definir tags');
    }
  }

  async removeTags(hash: string | string[], tags: string[]): Promise<void> {
    try {
      await this.ensureAuthenticated();
      
      const hashes = Array.isArray(hash) ? hash.join('|') : hash;
      
      const response = await this.client.post('torrents/removeTags', null, {
        params: {
          hashes,
          tags: tags.join(','),
        },
      });

      if (response.status !== 200) {
        throw new Error(`Erro ao remover tags: ${response.status}`);
      }
    } catch (error) {
      console.error('Erro ao remover tags:', error);
      throw new Error('Falha ao remover tags');
    }
  }

  async setSpeedLimit(hash: string | string[], limit: number): Promise<void> {
    try {
      await this.ensureAuthenticated();
      
      const hashes = Array.isArray(hash) ? hash.join('|') : hash;
      
      const response = await this.client.post('torrents/setDownloadLimit', null, {
        params: {
          hashes,
          limit,
        },
      });

      if (response.status !== 200) {
        throw new Error(`Erro ao definir limite de velocidade: ${response.status}`);
      }
    } catch (error) {
      console.error('Erro ao definir limite de velocidade:', error);
      throw new Error('Falha ao definir limite de velocidade');
    }
  }

  async getCategories(): Promise<Record<string, QbittorrentCategory>> {
    try {
      await this.ensureAuthenticated();
      
      const response = await this.client.get('torrents/categories');
      
      if (response.status === 200) {
        return response.data || {};
      }
      
      throw new Error(`Erro ao obter categorias: ${response.status}`);
    } catch (error) {
      console.error('Erro ao obter categorias:', error);
      throw new Error('Falha ao obter categorias');
    }
  }

  async createCategory(name: string, savePath: string): Promise<void> {
    try {
      await this.ensureAuthenticated();
      
      const response = await this.client.post('torrents/createCategory', null, {
        params: {
          category: name,
          savePath,
        },
      });

      if (response.status !== 200) {
        throw new Error(`Erro ao criar categoria: ${response.status}`);
      }
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      throw new Error('Falha ao criar categoria');
    }
  }

  async deleteCategory(name: string): Promise<void> {
    try {
      await this.ensureAuthenticated();
      
      const response = await this.client.post('torrents/removeCategories', null, {
        params: {
          categories: name,
        },
      });

      if (response.status !== 200) {
        throw new Error(`Erro ao deletar categoria: ${response.status}`);
      }
    } catch (error) {
      console.error('Erro ao deletar categoria:', error);
      throw new Error('Falha ao deletar categoria');
    }
  }

  async getServerStats(): Promise<any> {
    try {
      await this.ensureAuthenticated();
      
      const response = await this.client.get('server/stats');
      
      if (response.status === 200) {
        return response.data;
      }
      
      throw new Error(`Erro ao obter estatísticas: ${response.status}`);
    } catch (error) {
      console.error('Erro ao obter estatísticas do servidor:', error);
      throw new Error('Falha ao obter estatísticas');
    }
  }

  async getPreferences(): Promise<any> {
    try {
      await this.ensureAuthenticated();
      
      const response = await this.client.get('app/preferences');
      
      if (response.status === 200) {
        return response.data;
      }
      
      throw new Error(`Erro ao obter preferências: ${response.status}`);
    } catch (error) {
      console.error('Erro ao obter preferências:', error);
      throw new Error('Falha ao obter preferências');
    }
  }

  async setPreferences(preferences: Record<string, any>): Promise<void> {
    try {
      await this.ensureAuthenticated();
      
      const response = await this.client.post('app/setPreferences', { json: JSON.stringify(preferences) });
      
      if (response.status !== 200) {
        throw new Error(`Erro ao definir preferências: ${response.status}`);
      }
    } catch (error) {
      console.error('Erro ao definir preferências:', error);
      throw new Error('Falha ao definir preferências');
    }
  }

  async getApplicationVersion(): Promise<string> {
    try {
      await this.ensureAuthenticated();
      
      const response = await this.client.get('app/webapiVersion');
      
      if (response.status === 200) {
        return response.data;
      }
      
      throw new Error(`Erro ao obter versão: ${response.status}`);
    } catch (error) {
      console.error('Erro ao obter versão:', error);
      throw new Error('Falha ao obter versão');
    }
  }

  async shutdown(): Promise<void> {
    try {
      await this.ensureAuthenticated();
      
      const response = await this.client.post('app/shutdown');
      
      if (response.status !== 200) {
        throw new Error(`Erro ao desligar: ${response.status}`);
      }
    } catch (error) {
      console.error('Erro ao desligar qBittorrent:', error);
      throw new Error('Falha ao desligar qBittorrent');
    }
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      if (this.username && this.password) {
        await this.authenticate(this.username, this.password);
      }

      const response = await this.client.get('app/webapiVersion');

      if (response.status === 200) {
        return {
          success: true,
          message: `Conexão estabelecida com sucesso (qBittorrent ${response.data})`,
        };
      } else if (response.status === 403) {
        return {
          success: false,
          message: 'Credenciais inválidas. Verifique seu usuário e senha.',
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
          message: 'Não foi possível conectar. Verifique a URL do qBittorrent.',
        };
      }

      if (errorMessage.includes('ENOTFOUND')) {
        return {
          success: false,
          message: 'Domínio não encontrado. Verifique a URL.',
        };
      }

      return {
        success: false,
        message: `Erro ao conectar: ${errorMessage}`,
      };
    }
  }
}
