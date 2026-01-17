import { z } from 'zod';
import { protectedProcedure, router } from '../_core/trpc';
import { JexactylClient } from '../integrations/jexactyl';
import { TRPCError } from '@trpc/server';

export const jexactylRouter = router({
  // Listagem automática de servidores
  listServers: protectedProcedure
    .input(z.object({
      domain: z.string().url('Domínio inválido'),
      apiToken: z.string().min(1, 'API Token obrigatório'),
      page: z.number().int().positive().default(1),
    }))
    .query(async ({ input }) => {
      try {
        const client = new JexactylClient({
          domain: input.domain,
          apiToken: input.apiToken,
        });
        
        const { servers, pagination } = await client.getServers(input.page);
        
        return {
          servers: servers.map(server => ({
            id: server.attributes.identifier,
            uuid: server.attributes.uuid,
            name: server.attributes.name,
            node: server.attributes.node,
            status: server.attributes.status,
            isSuspended: server.attributes.is_suspended,
            isInstalling: server.attributes.is_installing,
            isTransferring: server.attributes.is_transferring,
            description: server.attributes.description,
          })),
          pagination,
          total: pagination.total || 0,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Erro ao listar servidores',
        });
      }
    }),

  // Obter detalhes de um servidor específico
  getServerDetails: protectedProcedure
    .input(z.object({
      domain: z.string().url(),
      apiToken: z.string().min(1),
      serverId: z.string().min(1),
    }))
    .query(async ({ input }) => {
      try {
        const client = new JexactylClient({
          domain: input.domain,
          apiToken: input.apiToken,
        });
        
        const server = await client.getServerDetails(input.serverId);
        
        return {
          id: server.attributes.identifier,
          uuid: server.attributes.uuid,
          name: server.attributes.name,
          node: server.attributes.node,
          status: server.attributes.status,
          isSuspended: server.attributes.is_suspended,
          isInstalling: server.attributes.is_installing,
          isTransferring: server.attributes.is_transferring,
          description: server.attributes.description,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Erro ao obter detalhes do servidor',
        });
      }
    }),

  // Obter estatísticas em tempo real
  getServerStats: protectedProcedure
    .input(z.object({
      domain: z.string().url(),
      apiToken: z.string().min(1),
      serverId: z.string().min(1),
    }))
    .query(async ({ input }) => {
      try {
        const client = new JexactylClient({
          domain: input.domain,
          apiToken: input.apiToken,
        });
        
        const stats = await client.getServerStats(input.serverId);
        
        return {
          currentState: stats.attributes.current_state,
          isSuspended: stats.attributes.is_suspended,
          resources: {
            memoryBytes: stats.attributes.resources.memory_bytes,
            memoryLimitBytes: stats.attributes.resources.memory_limit_bytes,
            cpuAbsolute: stats.attributes.resources.cpu_absolute,
            diskBytes: stats.attributes.resources.disk_bytes,
            network: {
              rxBytes: stats.attributes.resources.network.rx_bytes,
              txBytes: stats.attributes.resources.network.tx_bytes,
            },
          },
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Erro ao obter estatísticas',
        });
      }
    }),

  // Executar comando (start, stop, restart, kill)
  executeCommand: protectedProcedure
    .input(z.object({
      domain: z.string().url(),
      apiToken: z.string().min(1),
      serverId: z.string().min(1),
      command: z.enum(['start', 'stop', 'restart', 'kill']),
    }))
    .mutation(async ({ input }) => {
      try {
        const client = new JexactylClient({
          domain: input.domain,
          apiToken: input.apiToken,
        });
        
        await client.sendCommand(input.serverId, input.command);
        
        return {
          success: true,
          message: `Comando '${input.command}' enviado com sucesso`,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Erro ao executar comando',
        });
      }
    }),

  // Listar arquivos
  listFiles: protectedProcedure
    .input(z.object({
      domain: z.string().url(),
      apiToken: z.string().min(1),
      serverId: z.string().min(1),
      directory: z.string().default('/'),
    }))
    .query(async ({ input }) => {
      try {
        const client = new JexactylClient({
          domain: input.domain,
          apiToken: input.apiToken,
        });
        
        const files = await client.listFiles(input.serverId, input.directory);
        
        return files.map(file => ({
          name: file.attributes.name,
          mode: file.attributes.mode,
          size: file.attributes.size,
          isFile: file.attributes.is_file,
          isDirectory: file.attributes.is_directory,
          isSymlink: file.attributes.is_symlink,
        }));
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Erro ao listar arquivos',
        });
      }
    }),

  // Obter conteúdo de arquivo
  getFileContents: protectedProcedure
    .input(z.object({
      domain: z.string().url(),
      apiToken: z.string().min(1),
      serverId: z.string().min(1),
      filePath: z.string().min(1),
    }))
    .query(async ({ input }) => {
      try {
        const client = new JexactylClient({
          domain: input.domain,
          apiToken: input.apiToken,
        });
        
        const contents = await client.getFileContents(input.serverId, input.filePath);
        
        return {
          path: input.filePath,
          contents,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Erro ao obter conteúdo do arquivo',
        });
      }
    }),

  // Escrever conteúdo de arquivo
  writeFileContents: protectedProcedure
    .input(z.object({
      domain: z.string().url(),
      apiToken: z.string().min(1),
      serverId: z.string().min(1),
      filePath: z.string().min(1),
      contents: z.string(),
    }))
    .mutation(async ({ input }) => {
      try {
        const client = new JexactylClient({
          domain: input.domain,
          apiToken: input.apiToken,
        });
        
        await client.writeFileContents(input.serverId, input.filePath, input.contents);
        
        return {
          success: true,
          message: 'Arquivo salvo com sucesso',
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Erro ao salvar arquivo',
        });
      }
    }),

  // Renomear arquivo
  renameFile: protectedProcedure
    .input(z.object({
      domain: z.string().url(),
      apiToken: z.string().min(1),
      serverId: z.string().min(1),
      oldPath: z.string().min(1),
      newPath: z.string().min(1),
    }))
    .mutation(async ({ input }) => {
      try {
        const client = new JexactylClient({
          domain: input.domain,
          apiToken: input.apiToken,
        });
        
        await client.renameFile(input.serverId, input.oldPath, input.newPath);
        
        return {
          success: true,
          message: 'Arquivo renomeado com sucesso',
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Erro ao renomear arquivo',
        });
      }
    }),

  // Deletar arquivo
  deleteFile: protectedProcedure
    .input(z.object({
      domain: z.string().url(),
      apiToken: z.string().min(1),
      serverId: z.string().min(1),
      filePath: z.string().min(1),
    }))
    .mutation(async ({ input }) => {
      try {
        const client = new JexactylClient({
          domain: input.domain,
          apiToken: input.apiToken,
        });
        
        await client.deleteFile(input.serverId, input.filePath);
        
        return {
          success: true,
          message: 'Arquivo deletado com sucesso',
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Erro ao deletar arquivo',
        });
      }
    }),

  // Criar pasta
  createFolder: protectedProcedure
    .input(z.object({
      domain: z.string().url(),
      apiToken: z.string().min(1),
      serverId: z.string().min(1),
      folderPath: z.string().min(1),
    }))
    .mutation(async ({ input }) => {
      try {
        const client = new JexactylClient({
          domain: input.domain,
          apiToken: input.apiToken,
        });
        
        await client.createFolder(input.serverId, input.folderPath);
        
        return {
          success: true,
          message: 'Pasta criada com sucesso',
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Erro ao criar pasta',
        });
      }
    }),
});
