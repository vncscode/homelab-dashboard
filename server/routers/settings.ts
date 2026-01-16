import { z } from 'zod';
import { protectedProcedure, router } from '../_core/trpc';
import {
  getJexactylServers,
  createJexactylServer,
  updateJexactylServer,
  deleteJexactylServer,
  getQbittorrentInstances,
  createQbittorrentInstance,
  updateQbittorrentInstance,
  deleteQbittorrentInstance,
  getGlancesInstances,
  createGlancesInstance,
  updateGlancesInstance,
  deleteGlancesInstance,
} from '../db';

export const settingsRouter = router({
  // Jexactyl Settings
  jexactyl: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await getJexactylServers(ctx.user.id);
    }),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1),
          apiUrl: z.string().url(),
          apiKey: z.string().min(1),
          serverId: z.string().min(1),
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
          apiUrl: z.string().url().optional(),
          apiKey: z.string().min(1).optional(),
          serverId: z.string().min(1).optional(),
          description: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        await updateJexactylServer(input.id, {
          name: input.name,
          apiUrl: input.apiUrl,
          apiKey: input.apiKey,
          serverId: input.serverId,
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
  }),
});
