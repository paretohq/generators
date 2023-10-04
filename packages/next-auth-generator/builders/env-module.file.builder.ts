import { file_template } from "../templates/env-module.template";

type EnvModuleFileBuilderPayload = {
  server_block: string;
  runtime_block: string;
};

export function envModuleFileBuilder({
  server_block,
  runtime_block,
}: EnvModuleFileBuilderPayload) {
  return file_template
    .replace("<<SERVER_BLOCK>>", server_block)
    .replace("<<RUNTIME_BLOCK>>", runtime_block);
}
