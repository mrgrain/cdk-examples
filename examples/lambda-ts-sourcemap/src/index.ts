import { Handler } from "aws-lambda";

export const handler: Handler<void, string> = async () => {
  /**
   * This comment
   * only increased
   * the line numbers
   */
  throw Error("This error should be reported as thrown in index.ts:9");
};
