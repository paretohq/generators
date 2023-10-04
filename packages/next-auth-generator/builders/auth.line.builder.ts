import { providerProviderNameMap, providerVarnameMap } from "../globals";
import { provider_block } from "../templates/auth.template";
import { OAuthProvider } from "../types";

export function authLineBuilder(provider: OAuthProvider) {
  return provider_block
    .replace("<<ProviderName>>", providerProviderNameMap.get(provider)!)
    .replaceAll("<<PROVIDER>>", providerVarnameMap.get(provider)!);
}
