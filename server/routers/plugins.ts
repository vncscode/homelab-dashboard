import { z } from 'zod';
import { protectedProcedure, router } from '../_core/trpc';
import {
  getPlugins,
  getPluginById,
  createPlugin,
  updatePlugin,
  deletePlugin,
  getPluginStats,
  updatePluginStats,
} from '../db';

const AVAILABLE_PLUGINS = [
  {
    id: 'jexactyl',
    name: 'Jexactyl',
    type: 'jexactyl' as const,
    version: '1.0.0',
    description: 'Gerenciamento completo de servidores com console em tempo real',
    icon: 'Server',
    color: '#8B5CF6',
  },
  {
    id: 'qbittorrent',
    name: 'qBittorrent',
    type: 'qbittorrent' as const,
    version: '1.0.0',
    description: 'Gerenciamento de torrents com progresso em tempo real',
    icon: 'Download',
    color: '#EC4899',
  },
  {
    id: 'glances',
    name: 'Glances',
    type: 'glances' as const,
    version: '1.0.0',
    description: 'Monitoramento de recursos do sistema em tempo real',
    icon: 'HardDrive',
    color: '#06B6D4',
  },
];

export const pluginsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return await getPlugins(ctx.user.id);
  }),

  available: protectedProcedure.query(async ({ ctx }) => {
    const installed = await getPlugins(ctx.user.id);
    const installedIds = installed.map(p => p.type);
    
    return AVAILABLE_PLUGINS.map(plugin => ({
      ...plugin,
      isInstalled: installedIds.includes(plugin.type),
    }));
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await getPluginById(input.id);
    }),

  install: protectedProcedure
    .input(z.object({
      type: z.enum(['jexactyl', 'qbittorrent', 'glances']),
    }))
    .mutation(async ({ ctx, input }) => {
      const plugin = AVAILABLE_PLUGINS.find(p => p.type === input.type);
      if (!plugin) throw new Error('Plugin not found');

      await createPlugin(ctx.user.id, {
        name: plugin.name,
        type: input.type,
        isInstalled: 1,
        isEnabled: 1,
        version: plugin.version,
        description: plugin.description,
        icon: plugin.icon,
        color: plugin.color,
      } as any);

      return { success: true };
    }),

  uninstall: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await deletePlugin(input.id);
      return { success: true };
    }),

  enable: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await updatePlugin(input.id, { isEnabled: 1 });
      return { success: true };
    }),

  disable: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await updatePlugin(input.id, { isEnabled: 0 });
      return { success: true };
    }),

  getStats: protectedProcedure
    .input(z.object({ pluginId: z.number() }))
    .query(async ({ input }) => {
      return await getPluginStats(input.pluginId);
    }),

  updateStats: protectedProcedure
    .input(z.object({
      pluginId: z.number(),
      key: z.string(),
      value: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      await updatePluginStats(input.pluginId, ctx.user.id, input.key, input.value);
      return { success: true };
    }),
});
