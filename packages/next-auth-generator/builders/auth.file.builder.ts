import { file_template } from "../templates/auth.template";

type AuthFileBuilderPayload = {
  imports_block: string;
  providers_block: string;
};
export function authFileBuilder(blocks: AuthFileBuilderPayload) {
  return file_template
    .replace("<<IMPORTS_BLOCK>>", blocks.imports_block)
    .replace("<<PROVIDERS_BLOCK>>", blocks.providers_block);
}
