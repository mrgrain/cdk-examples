import { SSMClient, GetParametersByPathCommand } from "@aws-sdk/client-ssm";

export interface Config {
  SLACK_SIGNING_SECRET: string;
  SLACK_BOT_TOKEN: string;
}

let configCache: Config | undefined;

export async function getConfig(path: string): Promise<Config> {
  if (!configCache) {
    const client = new SSMClient({});
    const command = new GetParametersByPathCommand({
      Path: path,
      WithDecryption: true,
    });
    const response = await client.send(command);

    configCache = Object.fromEntries(
      response.Parameters?.map(({ Name, Value }): [string, string] => [
        Name!.split("/").pop() ?? Name!,
        Value!,
      ]) ?? []
    ) as unknown as Config;
  }

  return {
    ...configCache,
  };
}
