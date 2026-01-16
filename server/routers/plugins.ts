import { z } from 'zod';
import { TRPCError } from '@trpc/server';
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

/**
 * Available plugins with metadata
 */
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
] as const;

/**
 * Plugin type guard
 */
function isValidPluginType(type: string): type is 'jexactyl' | 'qbittorrent' | 'glances' {
  return ['jexactyl', 'qbittorrent', 'glances'].includes(type);
}

/**
 * Get plugin metadata by type
 */
function getPluginMetadata(type: 'jexactyl' | 'qbittorrent' | 'glances') {
  const plugin = AVAILABLE_PLUGINS.find(p => p.type === type);
  if (!plugin) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: `Plugin type "${type}" not found`,
    });
  }
  return plugin;
}

export const pluginsRouter = router({
  /**
   * List installed plugins for current user
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    try {
      const plugins = await getPlugins(ctx.user.id);
      return plugins || [];
    } catch (error) {
      console.error('[Plugins] Failed to list plugins:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to list plugins',
      });
    }
  }),

  /**
   * Get available plugins with installation status
   */
  available: protectedProcedure.query(async ({ ctx }) => {
    try {
      const installed = await getPlugins(ctx.user.id);
      const installedTypes = new Set(installed.map(p => p.type));
      
      return AVAILABLE_PLUGINS.map(plugin => ({
        ...plugin,
        isInstalled: installedTypes.has(plugin.type),
      }));
    } catch (error) {
      console.error('[Plugins] Failed to get available plugins:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to get available plugins',
      });
    }
  }),

  /**
   * Get plugin by ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ input }) => {
      try {
        const plugin = await getPluginById(input.id);
        if (!plugin) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Plugin not found',
          });
        }
        return plugin;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error('[Plugins] Failed to get plugin by ID:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get plugin',
        });
      }
    }),

  /**
   * Install a new plugin
   */
  install: protectedProcedure
    .input(z.object({
      type: z.enum(['jexactyl', 'qbittorrent', 'glances']),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if plugin is already installed
        const installed = await getPlugins(ctx.user.id);
        if (installed.some(p => p.type === input.type)) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: `Plugin "${input.type}" is already installed`,
          });
        }

        const metadata = getPluginMetadata(input.type);

        await createPlugin(ctx.user.id, {
          name: metadata.name,
          type: input.type,
          isInstalled: 1,
          isEnabled: 1,
          version: metadata.version,
          description: metadata.description,
          icon: metadata.icon,
          color: metadata.color,
        } as any);

        return { success: true, message: `Plugin "${metadata.name}" installed successfully` };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error('[Plugins] Failed to install plugin:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to install plugin',
        });
      }
    }),

  /**
   * Uninstall a plugin
   */
  uninstall: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Verify plugin belongs to user
        const plugin = await getPluginById(input.id);
        if (!plugin || plugin.userId !== ctx.user.id) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You do not have permission to uninstall this plugin',
          });
        }

        await deletePlugin(input.id);
        return { success: true, message: 'Plugin uninstalled successfully' };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error('[Plugins] Failed to uninstall plugin:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to uninstall plugin',
        });
      }
    }),

  /**
   * Enable a plugin
   */
  enable: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const plugin = await getPluginById(input.id);
        if (!plugin || plugin.userId !== ctx.user.id) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You do not have permission to enable this plugin',
          });
        }

        if (plugin.isEnabled) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Plugin is already enabled',
          });
        }

        await updatePlugin(input.id, { isEnabled: 1 });
        return { success: true, message: 'Plugin enabled successfully' };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error('[Plugins] Failed to enable plugin:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to enable plugin',
        });
      }
    }),

  /**
   * Disable a plugin
   */
  disable: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const plugin = await getPluginById(input.id);
        if (!plugin || plugin.userId !== ctx.user.id) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You do not have permission to disable this plugin',
          });
        }

        if (!plugin.isEnabled) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Plugin is already disabled',
          });
        }

        await updatePlugin(input.id, { isEnabled: 0 });
        return { success: true, message: 'Plugin disabled successfully' };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error('[Plugins] Failed to disable plugin:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to disable plugin',
        });
      }
    }),

  /**
   * Get plugin statistics
   */
  getStats: protectedProcedure
    .input(z.object({ pluginId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      try {
        const plugin = await getPluginById(input.pluginId);
        if (!plugin || plugin.userId !== ctx.user.id) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You do not have permission to view this plugin',
          });
        }

        const stats = await getPluginStats(input.pluginId);
        return stats || [];
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error('[Plugins] Failed to get plugin stats:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get plugin statistics',
        });
      }
    }),

  /**
   * Update plugin statistics
   */
  updateStats: protectedProcedure
    .input(z.object({
      pluginId: z.number().int().positive(),
      key: z.string().min(1).max(255),
      value: z.string().max(1000),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const plugin = await getPluginById(input.pluginId);
        if (!plugin || plugin.userId !== ctx.user.id) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You do not have permission to update this plugin',
          });
        }

        await updatePluginStats(input.pluginId, ctx.user.id, input.key, input.value);
        return { success: true, message: 'Plugin statistics updated successfully' };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error('[Plugins] Failed to update plugin stats:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update plugin statistics',
        });
      }
    }),
});
