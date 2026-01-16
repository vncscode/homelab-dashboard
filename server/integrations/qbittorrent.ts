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
  upload_speed: number;
  download_speed: number;
  state: string;
  priority: number;
  num_seeds: number;
  num_leechs: number;
  num_complete: number;
  num_incomplete: number;
  added_on: number;
  completion_on: number;
  seen_complete: number;
  last_seen: number;
  [key: string]: unknown;
}

export interface QbittorrentPreferences {
  [key: string]: unknown;
}

export class QbittorrentClient {
  private client: AxiosInstance;
  private baseUrl: string;
  private username: string;
  private password: string;
  private authenticated = false;

  constructor(baseUrl: string, username: string, password: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.username = username;
    this.password = password;

    this.client = axios.create({
      baseURL: this.baseUrl,
      withCredentials: true,
    });
  }

  async authenticate(): Promise<void> {
    if (this.authenticated) return;

    try {
      const response = await this.client.post('/api/v2/auth/login', null, {
        params: {
          username: this.username,
          password: this.password,
        },
      });

      if (response.data === 'Ok.') {
        this.authenticated = true;
      } else {
        throw new Error('Authentication failed');
      }
    } catch (error) {
      throw new Error(`Failed to authenticate with qBittorrent: ${error}`);
    }
  }

  async getTorrents(): Promise<QbittorrentTorrent[]> {
    await this.authenticate();
    const response = await this.client.get('/api/v2/torrents/info');
    return response.data;
  }

  async getTorrent(hash: string): Promise<QbittorrentTorrent> {
    await this.authenticate();
    const response = await this.client.get('/api/v2/torrents/info', {
      params: { hashes: hash },
    });
    return response.data[0];
  }

  async addTorrent(
    torrentData: Uint8Array | string,
    options?: {
      savepath?: string;
      paused?: boolean;
      [key: string]: unknown;
    }
  ): Promise<void> {
    await this.authenticate();

    const formData = new FormData();
    if (typeof torrentData === 'string') {
      formData.append('urls', torrentData);
    } else {
      const buffer = new Uint8Array(torrentData).buffer;
      formData.append('torrents', new Blob([buffer]));
    }

    if (options?.savepath) {
      formData.append('savepath', options.savepath);
    }
    if (options?.paused) {
      formData.append('paused', 'true');
    }

    await this.client.post('/api/v2/torrents/add', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  async pauseTorrent(hash: string): Promise<void> {
    await this.authenticate();
    await this.client.get('/api/v2/torrents/pause', {
      params: { hashes: hash },
    });
  }

  async resumeTorrent(hash: string): Promise<void> {
    await this.authenticate();
    await this.client.get('/api/v2/torrents/resume', {
      params: { hashes: hash },
    });
  }

  async deleteTorrent(hash: string, deleteFiles = false): Promise<void> {
    await this.authenticate();
    await this.client.get('/api/v2/torrents/delete', {
      params: {
        hashes: hash,
        deleteFiles: deleteFiles ? 'true' : 'false',
      },
    });
  }

  async getPreferences(): Promise<QbittorrentPreferences> {
    await this.authenticate();
    const response = await this.client.get('/api/v2/app/preferences');
    return response.data;
  }

  async setPreferences(preferences: QbittorrentPreferences): Promise<void> {
    await this.authenticate();
    await this.client.post('/api/v2/app/preferences', preferences);
  }
}
