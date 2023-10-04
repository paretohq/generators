#!/usr/bin/env node

// bin.ts
import {readFileSync} from "fs";

// /workspaces/generators/packages/generator-context/node_modules/next-auth-generator/index.ts
import {writeFileSync} from "fs";
import {join} from "path";

// /workspaces/generators/packages/next-auth-generator/globals.ts
var providerVarnameMap = new Map([
  ["google", "GOOGLE"],
  ["github", "GITHUB"],
  ["discord", "DISCORD"]
]);
var providerProviderNameMap = new Map([
  ["google", "GoogleProvider"],
  ["github", "GithubProvider"],
  ["discord", "DiscordProvider"]
]);

// /workspaces/generators/packages/next-auth-generator/templates/auth.template.ts
var provider_block = `<<ProviderName>>({
  clientId: env.<<PROVIDER>>_CLIENT_ID,
  clientSecret: env.<<PROVIDER>>_CLIENT_SECRET,
}),
`;
var import_block = `import <<ProviderName>> from "next-auth/providers/<<provider>>"
`;
var file_template = `import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
<<IMPORTS_BLOCK>>

import { env } from "~/env.mjs";
import { db } from "~/server/db";

/**
 * Module augmentation for \`next-auth\` types. Allows us to add custom properties to the \`session\`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: DefaultSession["user"] & {
      id: string;
      // ...other properties
      // role: UserRole;
    };
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
      },
    }),
  },
  adapter: PrismaAdapter(db),
  providers: [
<<PROVIDERS_BLOCK>>
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the \`refresh_token_expires_in\` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
};

/**
 * Wrapper for \`getServerSession\` so that you don't need to import the \`authOptions\` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};`;

// /workspaces/generators/packages/next-auth-generator/builders/auth-import.line.builder.ts
function authImportLineBuilder(provider) {
  return import_block.replace("<<ProviderName>>", providerProviderNameMap.get(provider)).replace("<<provider>>", provider);
}

// /workspaces/generators/packages/next-auth-generator/builders/auth.file.builder.ts
function authFileBuilder(blocks) {
  return file_template.replace("<<IMPORTS_BLOCK>>", blocks.imports_block).replace("<<PROVIDERS_BLOCK>>", blocks.providers_block);
}

// /workspaces/generators/packages/next-auth-generator/builders/auth.line.builder.ts
function authLineBuilder(provider) {
  return provider_block.replace("<<ProviderName>>", providerProviderNameMap.get(provider)).replaceAll("<<PROVIDER>>", providerVarnameMap.get(provider));
}

// /workspaces/generators/packages/next-auth-generator/templates/env-module.template.ts
var server_block_template = `<<PROVIDER>>_CLIENT_ID: z.string(),
<<PROVIDER>>_CLIENT_SECRET: z.string(),
`;
var runtime_block_template = `<<PROVIDER>>_CLIENT_ID: process.env.<<PROVIDER>>_CLIENT_ID,
<<PROVIDER>>_CLIENT_SECRET: process.env.<<PROVIDER>>_CLIENT_SECRET,
`;
var file_template2 = `import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    DATABASE_URL: z
      .string()
      .url()
      .refine(
        (str) => !str.includes("YOUR_MYSQL_URL_HERE"),
        "You forgot to change the default URL"
      ),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    NEXTAUTH_SECRET:
      process.env.NODE_ENV === "production"
        ? z.string().min(1)
        : z.string().min(1).optional(),
    NEXTAUTH_URL: z.preprocess(
      // This makes Vercel deployments not fail if you don't set NEXTAUTH_URL
      // Since NextAuth.js automatically uses the VERCEL_URL if present.
      (str) => process.env.VERCEL_URL ?? str,
      // VERCEL_URL doesn't include \`https\` so it cant be validated as a URL
      process.env.VERCEL ? z.string().min(1) : z.string().url()
    ),
    // Add \`.min(1) on ID and SECRET if you want to make sure they're not empty
<<SERVER_BLOCK>>  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * \`NEXT_PUBLIC_\`.
   */
  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string().min(1),
  },

  /**
   * You can't destruct \`process.env\` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
<<RUNTIME_BLOCK>>  },
  /**
   * Run \`build\` or \`dev\` with \`SKIP_ENV_VALIDATION\` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});`;

// /workspaces/generators/packages/next-auth-generator/builders/env-module.file.builder.ts
function envModuleFileBuilder({
  server_block,
  runtime_block
}) {
  return file_template2.replace("<<SERVER_BLOCK>>", server_block).replace("<<RUNTIME_BLOCK>>", runtime_block);
}

// /workspaces/generators/packages/next-auth-generator/builders/env-module.line.builder.ts
function serverBlockLineBuilder(provider) {
  return server_block_template.replaceAll("<<PROVIDER>>", providerVarnameMap2.get(provider));
}
function runtimeBlockLineBuilder(provider) {
  return runtime_block_template.replaceAll("<<PROVIDER>>", providerVarnameMap2.get(provider)).replaceAll("<<PROVIDER>>", providerVarnameMap2.get(provider));
}
var providerVarnameMap2 = new Map([
  ["google", "GOOGLE"],
  ["github", "GITHUB"],
  ["discord", "DISCORD"]
]);

// /workspaces/generators/packages/next-auth-generator/templates/env-file.template.ts
var block_template = `# <<Provider>> client credentials
<<PROVIDER>>_CLIENT_ID=""
<<PROVIDER>>_CLIENT_SECRET=""

`;
var file_template3 = `
# When adding additional environment variables, the schema in "/src/env.mjs"
# should be updated accordingly.

# Prisma
# https://www.prisma.io/docs/reference/database-reference/connection-urls#env
DATABASE_URL="file:./db.sqlite"

# Next Auth
# You can generate a new secret on the command line with:
# openssl rand -base64 32
# https://next-auth.js.org/configuration/options#secret
# NEXTAUTH_SECRET=""
NEXTAUTH_URL="http://localhost:3000"

<<PROVIDERS_BLOCK>>`;

// /workspaces/generators/packages/next-auth-generator/builders/env.file.builder.ts
function envFileBuilder(block) {
  return file_template3.replace("<<PROVIDERS_BLOCK>>", block);
}

// /workspaces/generators/packages/next-auth-generator/builders/env.line.builder.ts
function envLineBuilder(provider) {
  return block_template.replaceAll("<<Provider>>", provider).replaceAll("<<PROVIDER>>", providerVarnameMap.get(provider));
}

// /workspaces/generators/packages/generator-context/node_modules/next-auth-generator/index.ts
class NextAuthGenerator {
  schema;
  prepare_promise;
  blocks = null;
  paths;
  constructor(schema) {
    this.schema = schema;
    const app_path = process.cwd();
    const src_path = join(app_path, "src");
    this.paths = {
      env_file_path: join(app_path, ".env"),
      env_module_path: join(src_path, "env.mjs"),
      auth_file_path: join(src_path, "server", "auth.ts")
    };
    this.prepare_promise = this.prepare();
  }
  async generateEnvironmentFileBlock() {
    return this.schema.auth.oauth_providers.reduce((block, provider) => {
      return block + envLineBuilder(provider);
    }, "");
  }
  async generateEnvironmentModuleBlocks() {
    return this.schema.auth.oauth_providers.reduce((blocks, provider) => {
      blocks.server_block += serverBlockLineBuilder(provider);
      blocks.runtime_block += runtimeBlockLineBuilder(provider);
      return blocks;
    }, { server_block: "", runtime_block: "" });
  }
  async generateAuthProvidersBlocks() {
    return this.schema.auth.oauth_providers.reduce((blocks, provider) => {
      blocks.imports_block += authImportLineBuilder(provider);
      blocks.providers_block += authLineBuilder(provider);
      return blocks;
    }, { imports_block: "", providers_block: "" });
  }
  async prepare() {
    try {
      const env_file_block = await this.generateEnvironmentFileBlock();
      const env_module_blocks = await this.generateEnvironmentModuleBlocks();
      const auth_file_blocks = await this.generateAuthProvidersBlocks();
      this.blocks = {
        env_file_block,
        env_module: env_module_blocks,
        auth_file: auth_file_blocks
      };
      return true;
    } catch (error) {
      return false;
    }
  }
  async execute() {
    try {
      await this.prepare_promise;
      console.log("Executing: NextAuthGenerator");
      if (!this.blocks)
        throw new Error("Unable to execute: NextAuthGenerator, blocks is null");
      writeFileSync(this.paths.env_file_path, envFileBuilder(this.blocks.env_file_block));
      writeFileSync(this.paths.env_module_path, envModuleFileBuilder(this.blocks.env_module));
      writeFileSync(this.paths.auth_file_path, authFileBuilder(this.blocks.auth_file));
      return true;
    } catch (error) {
      return false;
    }
  }
}

// index.ts
class GeneratorContext {
  schema;
  generators = [];
  constructor(schema) {
    this.schema = schema;
  }
  async prepare() {
    if (this.schema.auth.provider == "next-auth") {
      this.generators.push(new NextAuthGenerator(this.schema));
    }
  }
  execute() {
    for (let generator of this.generators) {
      generator.execute();
    }
  }
}

// globals.ts
import {join as join2} from "path";
var app_path = process.cwd();
var pareto_path = join2(app_path, ".pareto");
var schema_path = join2(pareto_path, "schema.json");
var paths = {
  app_path,
  pareto_path,
  schema_path
};

// bin.ts
var schema_json = readFileSync(paths.schema_path, "utf-8");
var schema = JSON.parse(schema_json);
var generator = new GeneratorContext(schema);
await generator.prepare();
generator.execute();
