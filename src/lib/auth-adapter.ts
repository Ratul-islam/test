/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient, SubscriptionStatus } from "@prisma/client";
import { Adapter } from "next-auth/adapters";

export function CustomPrismaAdapter(prisma: PrismaClient): Adapter {
    return {
      ...PrismaAdapter(prisma),
      createUser: async (data: any) => {
        return await prisma.admin.create({
          data: {
            name: data.name,
            email: data.email,
            image: data.image,
            userType: "UNSELECTED",
            trial: false,
            subscriptionStatus: "INCOMPLETE",
            subscriptionExpiry: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            phone: "",
            hashedPassword: "",
            autoRenew: false,
            depositPercentage: 15.0,
            emailVerified: data.emailVerified
          }
        });
      },
      getUser: (id) => prisma.admin.findUnique({ where: { id } }),
      getUserByEmail: (email) => prisma.admin.findUnique({ where: { email } }),
      updateUser: (data) => prisma.admin.update({
        where: { id: data.id },
        data: {
          name: data.name,
          email: data.email,
          image: data.image,
          emailVerified: data.emailVerified,
          subscriptionStatus: data.subscriptionStatus as SubscriptionStatus,
          subscriptionExpiry: data.subscriptionExpiry,
          trial: data.trial,
          autoRenew: data.autoRenew,
          depositPercentage: data.depositPercentage,
        }
      }),
      linkAccount: async (account: { userId: any; type: any; provider: any; providerAccountId: any; refresh_token: any; access_token: any; expires_at: any; token_type: any; scope: any; id_token: any; session_state: any; }) => {
        await prisma.account.create({
          data: {
            userId: account.userId,
            type: account.type,
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            refresh_token: account.refresh_token,
            access_token: account.access_token,
            expires_at: account.expires_at,
            token_type: account.token_type,
            scope: account.scope,
            id_token: account.id_token,
            session_state: account.session_state,
          },
        });
      },
      getUserByAccount: async ({ provider, providerAccountId }) => {
        const account = await prisma.account.findUnique({
          where: {
            provider_providerAccountId: {
              provider,
              providerAccountId,
            },
          },
          include: {
            admin: true,
          },
        });
        return account?.admin ?? null;
      },
      deleteUser: (id) => prisma.admin.delete({ where: { id } })
    };
  }