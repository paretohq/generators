export type OAuthProvider = "google" | "github" | "discord";

export type ParetoJsonSchema = {
  preset: "t3-legacy";
  auth: {
    provider: "next-auth" | "clerk";
    oauth_providers: OAuthProvider[];
  };
};