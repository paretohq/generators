import { OAuthProvider } from "./types";

export const providerVarnameMap = new Map<OAuthProvider, string>([
  ["google", "GOOGLE"],
  ["github", "GITHUB"],
  ["discord", "DISCORD"],
]);

export const providerProviderNameMap = new Map<OAuthProvider, string>([
  ["google", "GoogleProvider"],
  ["github", "GithubProvider"],
  ["discord", "DiscordProvider"],
]);
