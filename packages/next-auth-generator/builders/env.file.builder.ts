import { file_template } from "../templates/env-file.template";

export function envFileBuilder(block: string) {
  return file_template.replace("<<PROVIDERS_BLOCK>>", block);
}
