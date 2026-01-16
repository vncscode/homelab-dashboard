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
        const client = new JexactylClient(input.apiUrl, input.apiKey, input.serverId);
        return await client.getServerDetails();
      }),

    sendCommand: protectedProcedure
      .input(z.object({
        apiUrl: z.string(),
        apiKey: z.string(),
        serverId: z.string(),
        command: z.string(),
      }))
      .mutation(async ({ input }) => {
        const client = new JexactylClient(input.apiUrl, input.apiKey, input.serverId);
        await client.sendCommand(input.command);
        return { success: true };
      }),

    startServer: protectedProcedure
      .input(z.object({
        apiUrl: z.string(),
        apiKey: z.string(),
        serverId: z.string(),
      }))
      .mutation(async ({ input }) => {
        const client = new JexactylClient(input.apiUrl, input.apiKey, input.serverId);
        await client.startServer();
        return { success: true };
      }),

    stopServer: protectedProcedure
      .input(z.object({
        apiUrl: z.string(),
        apiKey: z.string(),
        serverId: z.string(),
      }))
      .mutation(async ({ input }) => {
        const client = new JexactylClient(input.apiUrl, input.apiKey, input.serverId);
        await client.stopServer();
        return { success: true };
      }),

    restartServer: protectedProcedure
      .input(z.object({
        apiUrl: z.string(),
        apiKey: z.string(),
        serverId: z.string(),
      }))
      .mutation(async ({ input }) => {
        const client = new JexactylClient(input.apiUrl, input.apiKey, input.serverId);
        await client.restartServer();
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
        const client = new JexactylClient(input.apiUrl, input.apiKey, input.serverId);
        return await client.getFiles(input.directory);
      }),

    getFileContents: protectedProcedure
      .input(z.object({
        apiUrl: z.string(),
        apiKey: z.string(),
        serverId: z.string(),
        filePath: z.string(),
      }))
      .query(async ({ input }) => {
        const client = new JexactylClient(input.apiUrl, input.apiKey, input.serverId);
        return await client.getFileContents(input.filePath);
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
        const client = new JexactylClient(input.apiUrl, input.apiKey, input.serverId);
        await client.writeFileContents(input.filePath, input.contents);
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
        const client = new JexactylClient(input.apiUrl, input.apiKey, input.serverId);
        await client.deleteFile(input.filePath);
        return { success: true };
      }),
  }),

  // qBittorrent Procedures
  qbittorrent: router({
    getTorrents: protectedProcedure
      .input(z.object({
        apiUrl: z.string(),
        username: z.string(),
        password: z.string(),
      }))
      .query(async ({ input }) => {
        const client = new QbittorrentClient(input.apiUrl, input.username, input.password);
        return await client.getTorrents();
      }),

    getTorrent: protectedProcedure
      .input(z.object({
        apiUrl: z.string(),
        username: z.string(),
        password: z.string(),
        hash: z.string(),
      }))
      .query(async ({ input }) => {
        const client = new QbittorrentClient(input.apiUrl, input.username, input.password);
        return await client.getTorrent(input.hash);
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
        const client = new QbittorrentClient(input.apiUrl, input.username, input.password);
        await client.addTorrent(input.torrentUrl, {
          savepath: input.savepath,
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
        const client = new QbittorrentClient(input.apiUrl, input.username, input.password);
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
        const client = new QbittorrentClient(input.apiUrl, input.username, input.password);
        await client.resumeTorrent(input.hash);
        return { success: true };
      }),

    deleteTorrent: protectedProcedure
      .input(z.object({
        apiUrl: z.string(),
        username: z.string(),
        password: z.string(),
        hash: z.string(),
        deleteFiles: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const client = new QbittorrentClient(input.apiUrl, input.username, input.password);
        await client.deleteTorrent(input.hash, input.deleteFiles);
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
