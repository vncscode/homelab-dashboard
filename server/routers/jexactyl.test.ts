import { describe, it, expect, vi, beforeEach } from 'vitest';
import { jexactylRouter } from './jexactyl';

const mockServerData = {
  object: 'server',
  attributes: {
    server_owner: true,
    identifier: 'server-1',
    uuid: 'uuid-1',
    name: 'Server 1',
    node: 'node-1',
    description: 'Test Server',
    status: 'online',
    is_suspended: false,
    is_installing: false,
    is_transferring: false,
  },
};

const mockFileData = {
  object: 'file',
  attributes: {
    name: 'test.txt',
    mode: '644',
    size: 100,
    is_file: true,
    is_directory: false,
    is_symlink: false,
  },
};

vi.mock('../integrations/jexactyl', () => ({
  JexactylClient: vi.fn().mockImplementation(() => ({
    getServers: vi.fn().mockResolvedValue({
      servers: [mockServerData],
      pagination: { total: 1, count: 1, per_page: 50, current_page: 1, total_pages: 1 },
    }),
    getServerDetails: vi.fn().mockResolvedValue(mockServerData),
    getServerStats: vi.fn().mockResolvedValue({
      object: 'stats',
      attributes: {
        current_state: 'running',
        is_suspended: false,
        resources: {
          memory_bytes: 1024,
          memory_limit_bytes: 2048,
          cpu_absolute: 50,
          disk_bytes: 5120,
          network: { rx_bytes: 1000, tx_bytes: 2000 },
        },
      },
    }),
    sendCommand: vi.fn().mockResolvedValue(undefined),
    listFiles: vi.fn().mockResolvedValue([mockFileData]),
    getFileContents: vi.fn().mockResolvedValue('file contents'),
    writeFileContents: vi.fn().mockResolvedValue(undefined),
    renameFile: vi.fn().mockResolvedValue(undefined),
    deleteFile: vi.fn().mockResolvedValue(undefined),
    createFolder: vi.fn().mockResolvedValue(undefined),
  })),
}));

describe('jexactylRouter', () => {
  let caller: any;

  beforeEach(() => {
    caller = jexactylRouter.createCaller({
      user: {
        id: 1,
        openId: 'test-user',
        email: 'test@example.com',
        name: 'Test User',
        loginMethod: 'manus',
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      },
    } as any);
  });

  describe('listServers', () => {
    it('deve listar servidores com sucesso', async () => {
      const result = await caller.listServers({
        domain: 'https://example.com',
        apiToken: 'test-token',
        page: 1,
      });

      expect(result).toHaveProperty('servers');
      expect(result).toHaveProperty('pagination');
      expect(Array.isArray(result.servers)).toBe(true);
      expect(result.servers.length).toBeGreaterThan(0);
    });
  });

  describe('getServerDetails', () => {
    it('deve obter detalhes do servidor', async () => {
      const result = await caller.getServerDetails({
        domain: 'https://example.com',
        apiToken: 'test-token',
        serverId: 'server-123',
      });

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('status');
      expect(result.id).toBe('server-1');
    });
  });

  describe('getServerStats', () => {
    it('deve obter estatisticas do servidor', async () => {
      const result = await caller.getServerStats({
        domain: 'https://example.com',
        apiToken: 'test-token',
        serverId: 'server-123',
      });

      expect(result).toHaveProperty('currentState');
      expect(result).toHaveProperty('resources');
      expect(result.resources).toHaveProperty('memoryBytes');
    });
  });

  describe('executeCommand', () => {
    it('deve executar comando start', async () => {
      const result = await caller.executeCommand({
        domain: 'https://example.com',
        apiToken: 'test-token',
        serverId: 'server-123',
        command: 'start',
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain('start');
    });

    it('deve executar comando stop', async () => {
      const result = await caller.executeCommand({
        domain: 'https://example.com',
        apiToken: 'test-token',
        serverId: 'server-123',
        command: 'stop',
      });

      expect(result.success).toBe(true);
    });

    it('deve executar comando restart', async () => {
      const result = await caller.executeCommand({
        domain: 'https://example.com',
        apiToken: 'test-token',
        serverId: 'server-123',
        command: 'restart',
      });

      expect(result.success).toBe(true);
    });

    it('deve executar comando kill', async () => {
      const result = await caller.executeCommand({
        domain: 'https://example.com',
        apiToken: 'test-token',
        serverId: 'server-123',
        command: 'kill',
      });

      expect(result.success).toBe(true);
    });
  });

  describe('listFiles', () => {
    it('deve listar arquivos', async () => {
      const result = await caller.listFiles({
        domain: 'https://example.com',
        apiToken: 'test-token',
        serverId: 'server-123',
        directory: '/',
      });

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('deve usar diretorio padrao', async () => {
      const result = await caller.listFiles({
        domain: 'https://example.com',
        apiToken: 'test-token',
        serverId: 'server-123',
      });

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getFileContents', () => {
    it('deve obter conteudo do arquivo', async () => {
      const result = await caller.getFileContents({
        domain: 'https://example.com',
        apiToken: 'test-token',
        serverId: 'server-123',
        filePath: '/config.txt',
      });

      expect(result).toHaveProperty('path');
      expect(result).toHaveProperty('contents');
      expect(result.path).toBe('/config.txt');
    });
  });

  describe('writeFileContents', () => {
    it('deve escrever conteudo do arquivo', async () => {
      const result = await caller.writeFileContents({
        domain: 'https://example.com',
        apiToken: 'test-token',
        serverId: 'server-123',
        filePath: '/config.txt',
        contents: 'new content',
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain('sucesso');
    });
  });

  describe('renameFile', () => {
    it('deve renomear arquivo', async () => {
      const result = await caller.renameFile({
        domain: 'https://example.com',
        apiToken: 'test-token',
        serverId: 'server-123',
        oldPath: '/old.txt',
        newPath: '/new.txt',
      });

      expect(result.success).toBe(true);
    });
  });

  describe('deleteFile', () => {
    it('deve deletar arquivo', async () => {
      const result = await caller.deleteFile({
        domain: 'https://example.com',
        apiToken: 'test-token',
        serverId: 'server-123',
        filePath: '/file.txt',
      });

      expect(result.success).toBe(true);
    });
  });

  describe('createFolder', () => {
    it('deve criar pasta', async () => {
      const result = await caller.createFolder({
        domain: 'https://example.com',
        apiToken: 'test-token',
        serverId: 'server-123',
        folderPath: '/new-folder',
      });

      expect(result.success).toBe(true);
    });
  });
});
