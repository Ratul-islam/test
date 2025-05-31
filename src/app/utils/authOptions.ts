/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { PrismaAdapter } from "@auth/prisma-adapter";
import { AuthOptions, DefaultSession, User } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import EmailProvider from "next-auth/providers/email";
import { sendMagicLinkEmail } from "@/lib/email";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import prisma from "@/app/utils/prismadb";


function CustomPrismaAdapter(p: PrismaClient) {
  const defaultAdapter = PrismaAdapter(p);
  
  return {
    ...defaultAdapter,
    createUser: async (data: any) => {
      const subscriptionExpiry = new Date();
      subscriptionExpiry.setDate(subscriptionExpiry.getDate() + 14);
      
      return await p.admin.create({
        data: {
          name: data.name,
          email: data.email,
          image: data.image,
          emailVerified: data.emailVerified,
          userType: "UNSELECTED",
          trial: false,
          subscriptionStatus: "INCOMPLETE",
          subscriptionExpiry,
          phone: "",
          hashedPassword: "",
          autoRenew: false,
          depositPercentage: 15.0,
          artistsNum : 0,
        }
      });
    },
    getUser: (id: string) => p.admin.findUnique({ where: { id } }),
    getUserByEmail: (email: string) => p.admin.findUnique({ where: { email } }),
    getUserByAccount: async (providerAccountId: { provider: string, providerAccountId: string }) => {
      const account = await p.account.findUnique({
        where: {
          provider_providerAccountId: {
            provider: providerAccountId.provider,
            providerAccountId: providerAccountId.providerAccountId
          }
        },
        select: {
          admin: true
        }
      });
      return account?.admin ?? null;
    },
    updateUser: (data: any) => p.admin.update({
      where: { id: data.id },
      data: {
        name: data.name,
        email: data.email,
        image: data.image,
        emailVerified: data.emailVerified,
        userType: data.userType,
        subscriptionStatus: data.subscriptionStatus,
        subscriptionExpiry: data.subscriptionExpiry,
        trial: data.trial,
        autoRenew: data.autoRenew,
        depositPercentage: data.depositPercentage,
        artistsNum : data.artistsNum
      }
    })
  };
}

export const authOptions: AuthOptions = {
  adapter: CustomPrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        }
      },
      profile(profile) {
        const subscriptionExpiry = new Date();
        subscriptionExpiry.setDate(subscriptionExpiry.getDate() + 14);
        
        return {
          id: profile.sub,
          name: profile.name || profile.email?.split('@')[0] || '',
          email: profile.email,
          image: profile.picture,
          emailVerified: new Date(),
          userType: "UNSELECTED",
          trial: false,
          subscriptionStatus: "INCOMPLETE",
          subscriptionExpiry,
          phone: "",
          hashedPassword: "",
          autoRenew: false,
          depositPercentage: 15.0,
          artistsNum : 0,
        };
      }
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        magicLink: { label: "Magic Link", type: "hidden", value: "false" }, // <-- add this line
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          throw new Error("Email is required");
        }
      
        const email = credentials.email.toLowerCase();
        const user = await prisma.admin.findUnique({
          where: { email },
          select: {
            id: true,
            name: true,
            email: true,
            hashedPassword: true,
            userType: true,
            depositPercentage: true,
            image: true,
            subscriptionStatus: true,
            subscriptionExpiry: true,
            trial: true,
            autoRenew: true,
            artistsNum: true,
            emailVerified: true,
          }
        });
      
        if (!user) {
          throw new Error("Invalid credentials");
        }
      
        // Check if coming from magic link
        if (credentials.magicLink === 'true') {
          // Skip password check for magic links
          console.log("Magic link authentication successful");
        } else if (credentials.password) {
          // Regular password authentication
          if (!user.hashedPassword) {
            throw new Error("Invalid credentials");
          }
      
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.hashedPassword
          );
      
          if (!isPasswordValid) {
            throw new Error("Invalid password");
          }
        } else {
          throw new Error("Invalid authentication method");
        }
      
        // Check if email is verified
        if (!user.emailVerified) {
          throw new Error("Please verify your email before signing in");
        }
      
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          userType: user.userType,
          depositPercentage: user.depositPercentage,
          image: user.image,
          subscriptionStatus: user.subscriptionStatus,
          subscriptionExpiry: user.subscriptionExpiry,
          trial: user.trial,
          autoRenew: user.autoRenew,
          emailVerified: user.emailVerified,
          artistsNum: user.artistsNum,
        } as User;
      }
      
    }),
    EmailProvider({
      server: {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      },
      from: process.env.EMAIL_FROM,
      maxAge: 10 * 60, // Magic links valid for 10 minutes
      // Add this to integrate with your magic link API
      sendVerificationRequest: async ({ identifier, url, provider }) => {
        // This will be replaced by your custom magic link handler
        try {
          // Extract the token from the URL
          const token = new URL(url).searchParams.get('token');
          
          if (!token) {
            throw new Error('Missing token in magic link URL');
          }
          
          // Lookup the user
          const user = await prisma.admin.findUnique({ 
            where: { email: identifier },
            select: { name: true }
          });
          
          // Use your existing magic link email function
          await sendMagicLinkEmail({
            email: identifier,
            name: user?.name || identifier.split('@')[0],
            token,
            isNewUser: !user
          });
        } catch (error: any) {
          console.error('Error sending verification request:', error);
          throw new Error('Failed to send verification email');
        }
      }
    })
  ],
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
    newUser: "/auth/new-user"
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' 
        ? '__Secure-next-auth.session-token' 
        : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.NODE_ENV === 'production' 
          ? '.pricd.co.uk' 
          : undefined
      }
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user, account, profile }) {
  if (account?.provider === "google") {
    try {
      // Check if an account already exists for this provider
      const existingAccount = await prisma.account.findUnique({
        where: {
          provider_providerAccountId: {
            provider: account.provider,
            providerAccountId: account.providerAccountId
          }
        }
      });

      if (existingAccount) {
        return true; // Account exists, proceed with sign in
      }

      // Check if user exists but doesn't have this account linked
      const existingUser = await prisma.admin.findUnique({
        where: { email: user.email as string }
      });

      if (existingUser) {
        // Link the account to existing user
        try {
          await prisma.account.create({
            data: {
              userId: existingUser.id,
              type: account.type,
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              refresh_token: account.refresh_token,
              access_token: account.access_token,
              expires_at: account.expires_at,
              token_type: account.token_type,
              scope: account.scope,
              id_token: account.id_token,
              session_state: account.session_state
            }
          });
        } catch (err) {
  if (err instanceof Error && (err as any).code === 'P2002') {
    // Account already linked by another process, ignore
    return true;
  }
  throw err;
}
        return true;
      }

      // Double-check: Does account exist for this provider (race condition safe-guard)?
      const doubleCheckAccount = await prisma.account.findUnique({
        where: {
          provider_providerAccountId: {
            provider: account.provider,
            providerAccountId: account.providerAccountId
          }
        }
      });
      if (doubleCheckAccount) {
        return true;
      }

      // Create new user and account
      const subscriptionExpiry = new Date();
      subscriptionExpiry.setDate(subscriptionExpiry.getDate() + 14);

      await prisma.admin.create({
        data: {
          email: user.email as string,
          name: user.name || (user.email as string).split('@')[0],
          image: user.image,
          userType: "UNSELECTED",
          trial: false,
          subscriptionStatus: "INCOMPLETE",
          subscriptionExpiry,
          phone: "",
          hashedPassword: "",
          autoRenew: false,
          depositPercentage: 15.0,
          emailVerified: new Date(),
          artistsNum: 0,
          accounts: {
            create: {
              type: account.type,
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              refresh_token: account.refresh_token,
              access_token: account.access_token,
              expires_at: account.expires_at,
              token_type: account.token_type,
              scope: account.scope,
              id_token: account.id_token,
              session_state: account.session_state
            }
          }
        }
      });
      return true;
    } catch (error) {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const err = error as { code: string };
    if (err.code === 'P2002') {
      return true; // Account already exists
    }
  }

  console.error("Google sign-in error:", error);
  return false;
}
  }
  return true;
},
      // Initial sign in
    async jwt({ token }: { user?: any; token?: any }) {
      // console.log("callback: ***",token, user)
      const today = new Date();
      const expiryDate = new Date(today.setDate(today.getDate() + 14));

      const checkUser = await prisma.admin.findUnique({
        where: { email: token.email }
      });

      // For subsequent calls
      if (token.email) {
        const dbUser = await prisma.admin.findUnique({
          where: { email: token.email as string }
        });

        if (dbUser) {
          token.id = dbUser.id;
          token.userType = dbUser.userType;
          token.subscriptionStatus = dbUser.subscriptionStatus;
          token.depositPercentage = dbUser.depositPercentage;
          token.autoRenew = dbUser.autoRenew;
          token.image = dbUser.image;
          token.subscriptionExpiry = dbUser.subscriptionExpiry;
          token.trial = dbUser.trial;
          token.artistsNum = dbUser.artistsNum;
        }
      }

      return token;
    },
    async session({ session, token }) {
      session.id = token.id as string; // <- this will now work!
      
      session.user.id = token.id as string;
      session.user.name = token.name as string;
      session.user.email = token.email as string;
      session.user.image = token.image as string | null;
      session.user.userType = token.userType as string;
      session.user.subscriptionStatus = token.subscriptionStatus as string;
      session.user.depositPercentage = token.depositPercentage as number;
      session.user.autoRenew = token.autoRenew as boolean;
      session.user.subscriptionExpiry = token.subscriptionExpiry as Date;
      session.user.trial = token.trial as boolean;
      session.user.artistsNum = token.artistsNum as number;
    
      return session;
    },

}}