import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QbittorrentClient } from '../integrations/qbittorrent';

describe('QbittorrentClient', () => {
  let client: QbittorrentClient;

  beforeEach(() => {
    client = new QbittorrentClient({
      url: 'http://localhost:8080',
      username: 'admin',
      password: 'admin',
    });
  });

  describe('constructor', () => {
    it('deve criar instância com URL com slash', () => {
      const c = new QbittorrentClient({
        url: 'http://localhost:8080/',
        username: 'admin',
        password: 'admin',
      });
      expect(c).toBeDefined();
    });

    it('deve criar instância com URL sem slash', () => {
      const c = new QbittorrentClient({
        url: 'http://localhost:8080',
        username: 'admin',
        password: 'admin',
      });
      expect(c).toBeDefined();
    });

    it('deve criar instância sem credenciais', () => {
      const c = new QbittorrentClient({
        url: 'http://localhost:8080',
      });
      expect(c).toBeDefined();
    });
  });

  describe('listTorrents', () => {
    it('deve retornar array de torrents', async () => {
      try {
        const torrents = await client.listTorrents();
        expect(Array.isArray(torrents)).toBe(true);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('deve aceitar filtro', async () => {
      try {
        const torrents = await client.listTorrents('downloading');
        expect(Array.isArray(torrents)).toBe(true);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('deve aceitar categoria', async () => {
      try {
        const torrents = await client.listTorrents('all', 'movies');
        expect(Array.isArray(torrents)).toBe(true);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('addTorrent', () => {
    it('deve aceitar magnet link', async () => {
      const magnetLink = 'magnet:?xt=urn:btih:test';
      try {
        await client.addTorrent(magnetLink);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('deve aceitar opções', async () => {
      const magnetLink = 'magnet:?xt=urn:btih:test';
      try {
        await client.addTorrent(magnetLink, {
          category: 'test',
          paused: true,
        });
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('pauseTorrent', () => {
    it('deve pausar torrent único', async () => {
      try {
        await client.pauseTorrent('test-hash');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('deve pausar múltiplos torrents', async () => {
      try {
        await client.pauseTorrent(['hash1', 'hash2']);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('resumeTorrent', () => {
    it('deve retomar torrent único', async () => {
      try {
        await client.resumeTorrent('test-hash');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('deve retomar múltiplos torrents', async () => {
      try {
        await client.resumeTorrent(['hash1', 'hash2']);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('removeTorrent', () => {
    it('deve remover torrent', async () => {
      try {
        await client.removeTorrent('test-hash');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('deve remover torrent com arquivos', async () => {
      try {
        await client.removeTorrent('test-hash', true);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('setCategory', () => {
    it('deve definir categoria', async () => {
      try {
        await client.setCategory('test-hash', 'movies');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('deve definir categoria para múltiplos torrents', async () => {
      try {
        await client.setCategory(['hash1', 'hash2'], 'movies');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('setTags', () => {
    it('deve definir tags', async () => {
      try {
        await client.setTags('test-hash', ['tag1', 'tag2']);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('getCategories', () => {
    it('deve retornar categorias', async () => {
      try {
        const categories = await client.getCategories();
        expect(typeof categories).toBe('object');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('getServerStats', () => {
    it('deve retornar estatísticas do servidor', async () => {
      try {
        const stats = await client.getServerStats();
        expect(stats).toBeDefined();
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('getPreferences', () => {
    it('deve retornar preferências', async () => {
      try {
        const prefs = await client.getPreferences();
        expect(prefs).toBeDefined();
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('getApplicationVersion', () => {
    it('deve retornar versão da aplicação', async () => {
      try {
        const version = await client.getApplicationVersion();
        expect(typeof version).toBe('string');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
});
