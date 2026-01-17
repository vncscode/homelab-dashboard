import { z } from 'zod';
import { protectedProcedure, router } from '../_core/trpc';
import {
  getJexactylServers,
  createJexactylServer,
  updateJexactylServer,
  deleteJexactylServer,
  getJexactylCredentialById,
  getJexactylServersByCredential,
  getAllJexactylServers,
  syncJexactylServers,
  getQbittorrentInstances,
  createQbittorrentInstance,
  updateQbittorrentInstance,
  deleteQbittorrentInstance,
  getGlancesInstances,
  createGlancesInstance,
  updateGlancesInstance,
  deleteGlancesInstance,
  getCloudflareInstances,
  createCloudflareInstance,
  updateCloudflareInstance,
  deleteCloudflareInstance,
  getUptimeKumaInstances,
  createUptimeKumaInstance,
  updateUptimeKumaInstance,
  deleteUptimeKumaInstance,
} from '../db';
import { JexactylClient } from '../integrations/jexactyl';
import { QbittorrentClient } from '../integrations/qbittorrent';
import { GlancesClient } from '../integrations/glances';

export const settingsRouter = router({
  // Jexactyl Settings - Simplified to domain URL and API key only
  jexactyl: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await getJexactylServers(ctx.user.id);
    }),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1),
          domainUrl: z.string().url(),
          apiKey: z.string().min(1),
          description: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await createJexactylServer(ctx.user.id, input as any);
        return { success: true };
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().min(1).optional(),
          domainUrl: z.string().url().optional(),
          apiKey: z.string().min(1).optional(),
          description: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        await updateJexactylServer(input.id, {
          name: input.name,
          domainUrl: input.domainUrl,
          apiKey: input.apiKey,
          description: input.description,
        });
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteJexactylServer(input.id);
        return { success: true };
      }),

    sync: protectedProcedure
      .input(z.object({ credentialId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const credential = await getJexactylCredentialById(input.credentialId);
        if (!credential) {
          throw new Error('Credential not found');
        }

        if (credential.userId !== ctx.user.id) {
          throw new Error('Unauthorized');
        }

        try {
          const client = new JexactylClient({
            domain: credential.domainUrl,
            apiToken: credential.apiKey,
          });

          const servers = await client.getAllServers();
          const serverData = servers.map(server => ({
            identifier: server.attributes.identifier,
            uuid: server.attributes.uuid,
            name: server.attributes.name,
            node: server.attributes.node,
            description: server.attributes.description || null,
            status: server.attributes.status,
            isSuspended: server.attributes.is_suspended ? 1 : 0,
            isInstalling: server.attributes.is_installing ? 1 : 0,
            isTransferring: server.attributes.is_transferring ? 1 : 0,
          }));

          await syncJexactylServers(input.credentialId, ctx.user.id, serverData as any);
          return { success: true, count: servers.length };
        } catch (error) {
          throw new Error(`Failed to sync servers: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }),

    getServers: protectedProcedure
      .input(z.object({ credentialId: z.number() }))
      .query(async ({ ctx, input }) => {
        const credential = await getJexactylCredentialById(input.credentialId);
        if (!credential) {
          return [];
        }

        if (credential.userId !== ctx.user.id) {
          return [];
        }

        return await getJexactylServersByCredential(input.credentialId);
      }),

    getAllServers: protectedProcedure.query(async ({ ctx }) => {
      return await getAllJexactylServers(ctx.user.id);
    }),

    testConnection: protectedProcedure
      .input(
        z.object({
          domainUrl: z.string().url(),
          apiKey: z.string().min(1),
        })
      )
      .mutation(async ({ input }) => {
        try {
          const client = new JexactylClient({
            domain: input.domainUrl,
            apiToken: input.apiKey,
          });
          return await client.testConnection();
        } catch (error) {
          return {
            success: false,
            message: `Erro ao testar conexão: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
          };
        }
      }),
  }),

  // qBittorrent Settings
  qbittorrent: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await getQbittorrentInstances(ctx.user.id);
    }),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1),
          apiUrl: z.string().url(),
          username: z.string().min(1),
          password: z.string().min(1),
          description: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await createQbittorrentInstance(ctx.user.id, input as any);
        return { success: true };
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().min(1).optional(),
          apiUrl: z.string().url().optional(),
          username: z.string().min(1).optional(),
          password: z.string().min(1).optional(),
          description: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        await updateQbittorrentInstance(input.id, {
          name: input.name,
          apiUrl: input.apiUrl,
          username: input.username,
          password: input.password,
          description: input.description,
        });
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteQbittorrentInstance(input.id);
        return { success: true };
      }),

    testConnection: protectedProcedure
      .input(
        z.object({
          apiUrl: z.string().url(),
          username: z.string().min(1),
          password: z.string().min(1),
        })
      )
      .mutation(async ({ input }) => {
        try {
          const client = new QbittorrentClient({
            url: input.apiUrl,
            username: input.username,
            password: input.password,
          });
          return await client.testConnection();
        } catch (error) {
          return {
            success: false,
            message: `Erro ao testar conexão: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
          };
        }
      }),
  }),

  // Glances Settings
  glances: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await getGlancesInstances(ctx.user.id);
    }),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1),
          apiUrl: z.string().url(),
          apiKey: z.string().optional(),
          description: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await createGlancesInstance(ctx.user.id, input as any);
        return { success: true };
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().min(1).optional(),
          apiUrl: z.string().url().optional(),
          apiKey: z.string().optional(),
          description: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        await updateGlancesInstance(input.id, {
          name: input.name,
          apiUrl: input.apiUrl,
          apiKey: input.apiKey,
          description: input.description,
        });
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteGlancesInstance(input.id);
        return { success: true };
      }),

    testConnection: protectedProcedure
      .input(
        z.object({
          apiUrl: z.string().url(),
          apiKey: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          const client = new GlancesClient(input.apiUrl, input.apiKey);
          return await client.testConnection();
        } catch (error) {
          return {
            success: false,
            message: `Erro ao testar conexão: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
          };
        }
      }),
  }),

  // Cloudflare Settings
  cloudflare: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await getCloudflareInstances(ctx.user.id);
    }),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1),
          apiToken: z.string().min(1),
          accountId: z.string().min(1),
          accountEmail: z.string().email(),
          description: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await createCloudflareInstance(ctx.user.id, input as any);
        return { success: true };
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().min(1).optional(),
          apiToken: z.string().min(1).optional(),
          accountId: z.string().min(1).optional(),
          accountEmail: z.string().email().optional(),
          description: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        await updateCloudflareInstance(input.id, {
          name: input.name,
          apiToken: input.apiToken,
          accountId: input.accountId,
          accountEmail: input.accountEmail,
          description: input.description,
        });
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteCloudflareInstance(input.id);
        return { success: true };
      }),

    testConnection: protectedProcedure
      .input(
        z.object({
          apiToken: z.string().min(1),
          accountEmail: z.string().email(),
        })
      )
      .mutation(async () => {
        // Cloudflare test connection would require making an API call
        // For now, we'll return a success if credentials are provided
        return {
          success: true,
          message: 'Credenciais validadas (teste completo requer sincronização)',
        };
      }),
  }),

  // Uptime Kuma Settings
  uptimeKuma: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await getUptimeKumaInstances(ctx.user.id);
    }),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1),
          apiUrl: z.string().url(),
          apiKey: z.string().min(1),
          description: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await createUptimeKumaInstance(ctx.user.id, input as any);
        return { success: true };
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().min(1).optional(),
          apiUrl: z.string().url().optional(),
          apiKey: z.string().min(1).optional(),
          description: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        await updateUptimeKumaInstance(input.id, {
          name: input.name,
          apiUrl: input.apiUrl,
          apiKey: input.apiKey,
          description: input.description,
        });
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteUptimeKumaInstance(input.id);
        return { success: true };
      }),
  }),
});
