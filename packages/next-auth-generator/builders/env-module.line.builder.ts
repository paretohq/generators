import {
  runtime_block_template,
  server_block_template,
} from "../templates/env-module.template";
import { OAuthProvider } from "../types";

const providerVarnameMap = new Map<OAuthProvider, string>([
  ["google", "GOOGLE"],
  ["github", "GITHUB"],
  ["discord", "DISCORD"],
]);

export function serverBlockLineBuilder(provider: OAuthProvider): string {
  return server_block_template.replaceAll(
    "<<PROVIDER>>",
    providerVarnameMap.get(provider)!
  );
}

export function runtimeBlockLineBuilder(provider: OAuthProvider): string {
  return runtime_block_template
    .replaceAll("<<PROVIDER>>", providerVarnameMap.get(provider)!)
    .replaceAll("<<PROVIDER>>", providerVarnameMap.get(provider)!);
}
