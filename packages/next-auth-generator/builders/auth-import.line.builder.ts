import { providerProviderNameMap } from "../globals";
import { import_block } from "../templates/auth.template";
import { OAuthProvider } from "../types";

export function authImportLineBuilder(provider: OAuthProvider) {
  return import_block
    .replace("<<ProviderName>>", providerProviderNameMap.get(provider)!)
    .replace("<<provider>>", provider);
}
