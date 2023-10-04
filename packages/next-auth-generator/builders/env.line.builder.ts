import { providerVarnameMap } from "../globals";
import { block_template } from "../templates/env-file.template";
import { OAuthProvider } from "../types";

export function envLineBuilder(provider: OAuthProvider) {
  return block_template
    .replaceAll("<<Provider>>", provider)
    .replaceAll("<<PROVIDER>>", providerVarnameMap.get(provider)!);
}
