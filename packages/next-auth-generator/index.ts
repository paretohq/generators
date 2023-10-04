import { writeFileSync } from "fs";
import { join } from "path";
import { authImportLineBuilder } from "./builders/auth-import.line.builder";
import { authFileBuilder } from "./builders/auth.file.builder";
import { authLineBuilder } from "./builders/auth.line.builder";
import { envModuleFileBuilder } from "./builders/env-module.file.builder";
import {
  runtimeBlockLineBuilder,
  serverBlockLineBuilder,
} from "./builders/env-module.line.builder";
import { envFileBuilder } from "./builders/env.file.builder";
import { envLineBuilder } from "./builders/env.line.builder";
import { ParetoJsonSchema } from "./types";

export class NextAuthGenerator {
  schema: ParetoJsonSchema;
  prepare_promise: Promise<Boolean>;
  blocks: {
    env_file_block: string;
    env_module: {
      server_block: string;
      runtime_block: string;
    };
    auth_file: {
      imports_block: string;
      providers_block: string;
    };
  } | null = null;

  paths: {
    env_file_path: string;
    env_module_path: string;
    auth_file_path: string;
  };

  constructor(schema: ParetoJsonSchema) {
    this.schema = schema;

    const app_path = process.cwd();
    const src_path = join(app_path, "src");

    this.paths = {
      env_file_path: join(app_path, ".env"),
      env_module_path: join(src_path, "env.mjs"),
      auth_file_path: join(src_path, "server", "auth.ts"),
    };

    this.prepare_promise = this.prepare();
  }

  // Generates .env block
  async generateEnvironmentFileBlock() {
    return this.schema.auth.oauth_providers.reduce((block, provider) => {
      return block + envLineBuilder(provider);
    }, "");
  }

  // Generate blocks for src/env.mjs
  async generateEnvironmentModuleBlocks() {
    return this.schema.auth.oauth_providers.reduce(
      (blocks, provider) => {
        blocks.server_block += serverBlockLineBuilder(provider);
        blocks.runtime_block += runtimeBlockLineBuilder(provider);
        return blocks;
      },
      { server_block: "", runtime_block: "" }
    );
  }

  // Generate block for src/server/auth.ts
  async generateAuthProvidersBlocks() {
    return this.schema.auth.oauth_providers.reduce(
      (blocks, provider) => {
        blocks.imports_block += authImportLineBuilder(provider);
        blocks.providers_block += authLineBuilder(provider);
        return blocks;
      },
      { imports_block: "", providers_block: "" }
    );
  }

  async prepare() {
    try {
      const env_file_block = await this.generateEnvironmentFileBlock();
      const env_module_blocks = await this.generateEnvironmentModuleBlocks();
      const auth_file_blocks = await this.generateAuthProvidersBlocks();
      this.blocks = {
        env_file_block,
        env_module: env_module_blocks,
        auth_file: auth_file_blocks,
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

      writeFileSync(
        this.paths.env_file_path,
        envFileBuilder(this.blocks.env_file_block)
      );

      writeFileSync(
        this.paths.env_module_path,
        envModuleFileBuilder(this.blocks.env_module)
      );

      writeFileSync(
        this.paths.auth_file_path,
        authFileBuilder(this.blocks.auth_file)
      );

      return true;
    } catch (error) {
      return false;
    }
  }
}
