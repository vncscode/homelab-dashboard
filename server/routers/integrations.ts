import { z } from 'zod';
import { protectedProcedure, router } from '../_core/trpc';
import { JexactylClient } from '../integrations/jexactyl';
import { QbittorrentClient } from '../integrations/qbittorrent';
import { GlancesClient } from '../integrations/glances';

export const integrationsRouter = router({
  // Jexactyl Procedures
  jexactyl: router({
    getServerDetails: protectedProcedure
      .input(z.object({
        apiUrl: z.string(),
        apiKey: z.string(),
        serverId: z.string(),
      }))
      .query(async ({ input }) => {
        const client = new JexactylClient({ domain: input.apiUrl, apiToken: input.apiKey });
        return await client.getServerDetails(input.serverId);
      }),

    sendCommand: protectedProcedure
      .input(z.object({
        apiUrl: z.string(),
        apiKey: z.string(),
        serverId: z.string(),
        command: z.string(),
      }))
      .mutation(async ({ input }) => {
        const client = new JexactylClient({ domain: input.apiUrl, apiToken: input.apiKey });
        await client.sendCommand(input.serverId, input.command as any);
        return { success: true };
      }),

    startServer: protectedProcedure
      .input(z.object({
        apiUrl: z.string(),
        apiKey: z.string(),
        serverId: z.string(),
      }))
      .mutation(async ({ input }) => {
        const client = new JexactylClient({ domain: input.apiUrl, apiToken: input.apiKey });
        await client.startServer(input.serverId);
        return { success: true };
      }),

    stopServer: protectedProcedure
      .input(z.object({
        apiUrl: z.string(),
        apiKey: z.string(),
        serverId: z.string(),
      }))
      .mutation(async ({ input }) => {
        const client = new JexactylClient({ domain: input.apiUrl, apiToken: input.apiKey });
        await client.stopServer(input.serverId);
        return { success: true };
      }),

    restartServer: protectedProcedure
      .input(z.object({
        apiUrl: z.string(),
        apiKey: z.string(),
        serverId: z.string(),
      }))
      .mutation(async ({ input }) => {
        const client = new JexactylClient({ domain: input.apiUrl, apiToken: input.apiKey });
        await client.restartServer(input.serverId);
        return { success: true };
      }),

    getFiles: protectedProcedure
      .input(z.object({
        apiUrl: z.string(),
        apiKey: z.string(),
        serverId: z.string(),
        directory: z.string().default('/'),
      }))
      .query(async ({ input }) => {
        const client = new JexactylClient({ domain: input.apiUrl, apiToken: input.apiKey });
        return await client.listFiles(input.serverId, input.directory);
      }),

    getFileContents: protectedProcedure
      .input(z.object({
        apiUrl: z.string(),
        apiKey: z.string(),
        serverId: z.string(),
        filePath: z.string(),
      }))
      .query(async ({ input }) => {
        const client = new JexactylClient({ domain: input.apiUrl, apiToken: input.apiKey });
        return await client.getFileContents(input.serverId, input.filePath);
      }),

    writeFileContents: protectedProcedure
      .input(z.object({
        apiUrl: z.string(),
        apiKey: z.string(),
        serverId: z.string(),
        filePath: z.string(),
        contents: z.string(),
      }))
      .mutation(async ({ input }) => {
        const client = new JexactylClient({ domain: input.apiUrl, apiToken: input.apiKey });
        await client.writeFileContents(input.serverId, input.filePath, input.contents);
        return { success: true };
      }),

    deleteFile: protectedProcedure
      .input(z.object({
        apiUrl: z.string(),
        apiKey: z.string(),
        serverId: z.string(),
        filePath: z.string(),
      }))
      .mutation(async ({ input }) => {
        const client = new JexactylClient({ domain: input.apiUrl, apiToken: input.apiKey });
        await client.deleteFile(input.serverId, input.filePath);
        return { success: true };
      }),
  }),

  // qBittorrent Procedures
  qbittorrent: router({
    listTorrents: protectedProcedure
      .input(z.object({
        apiUrl: z.string(),
        username: z.string(),
        password: z.string(),
      }))
      .query(async ({ input }) => {
        const client = new QbittorrentClient({ url: input.apiUrl, username: input.username, password: input.password });
        return await client.listTorrents();
      }),

    getTorrentDetails: protectedProcedure
      .input(z.object({
        apiUrl: z.string(),
        username: z.string(),
        password: z.string(),
        hash: z.string(),
      }))
      .query(async ({ input }) => {
        const client = new QbittorrentClient({ url: input.apiUrl, username: input.username, password: input.password });
        return await client.getTorrentDetails(input.hash);
      }),

    addTorrent: protectedProcedure
      .input(z.object({
        apiUrl: z.string(),
        username: z.string(),
        password: z.string(),
        torrentUrl: z.string(),
        savepath: z.string().optional(),
        paused: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const client = new QbittorrentClient({ url: input.apiUrl, username: input.username, password: input.password });
        await client.addTorrent(input.torrentUrl, {
          savePath: input.savepath,
          paused: input.paused,
        });
        return { success: true };
      }),

    pauseTorrent: protectedProcedure
      .input(z.object({
        apiUrl: z.string(),
        username: z.string(),
        password: z.string(),
        hash: z.string(),
      }))
      .mutation(async ({ input }) => {
        const client = new QbittorrentClient({ url: input.apiUrl, username: input.username, password: input.password });
        await client.pauseTorrent(input.hash);
        return { success: true };
      }),

    resumeTorrent: protectedProcedure
      .input(z.object({
        apiUrl: z.string(),
        username: z.string(),
        password: z.string(),
        hash: z.string(),
      }))
      .mutation(async ({ input }) => {
        const client = new QbittorrentClient({ url: input.apiUrl, username: input.username, password: input.password });
        await client.resumeTorrent(input.hash);
        return { success: true };
      }),

    removeTorrent: protectedProcedure
      .input(z.object({
        apiUrl: z.string(),
        username: z.string(),
        password: z.string(),
        hash: z.string(),
        deleteFiles: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const client = new QbittorrentClient({ url: input.apiUrl, username: input.username, password: input.password });
        await client.removeTorrent(input.hash, input.deleteFiles);
        return { success: true };
      }),
  }),

  // Glances Procedures
  glances: router({
    getStatus: protectedProcedure
      .input(z.object({
        apiUrl: z.string(),
        apiKey: z.string().optional(),
      }))
      .query(async ({ input }) => {
        const client = new GlancesClient(input.apiUrl, input.apiKey);
        return await client.getStatus();
      }),

    getAllData: protectedProcedure
      .input(z.object({
        apiUrl: z.string(),
        apiKey: z.string().optional(),
      }))
      .query(async ({ input }) => {
        const client = new GlancesClient(input.apiUrl, input.apiKey);
        return await client.getAllData();
      }),

    getCPU: protectedProcedure
      .input(z.object({
        apiUrl: z.string(),
        apiKey: z.string().optional(),
      }))
      .query(async ({ input }) => {
        const client = new GlancesClient(input.apiUrl, input.apiKey);
        return await client.getCPU();
      }),

    getMemory: protectedProcedure
      .input(z.object({
        apiUrl: z.string(),
        apiKey: z.string().optional(),
      }))
      .query(async ({ input }) => {
        const client = new GlancesClient(input.apiUrl, input.apiKey);
        return await client.getMemory();
      }),

    getDisks: protectedProcedure
      .input(z.object({
        apiUrl: z.string(),
        apiKey: z.string().optional(),
      }))
      .query(async ({ input }) => {
        const client = new GlancesClient(input.apiUrl, input.apiKey);
        return await client.getDisks();
      }),

    getNetwork: protectedProcedure
      .input(z.object({
        apiUrl: z.string(),
        apiKey: z.string().optional(),
      }))
      .query(async ({ input }) => {
        const client = new GlancesClient(input.apiUrl, input.apiKey);
        return await client.getNetwork();
      }),

    getProcesses: protectedProcedure
      .input(z.object({
        apiUrl: z.string(),
        apiKey: z.string().optional(),
        limit: z.number().optional(),
      }))
      .query(async ({ input }) => {
        const client = new GlancesClient(input.apiUrl, input.apiKey);
        return await client.getProcesses(input.limit);
      }),

    getProcessesSorted: protectedProcedure
      .input(z.object({
        apiUrl: z.string(),
        apiKey: z.string().optional(),
        sortBy: z.enum(['cpu_percent', 'memory_percent']).optional(),
        limit: z.number().optional(),
      }))
      .query(async ({ input }) => {
        const client = new GlancesClient(input.apiUrl, input.apiKey);
        return await client.getProcessesSorted(input.sortBy as any, input.limit);
      }),
  }),
});
