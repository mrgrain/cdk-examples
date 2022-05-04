import {
  App,
  Receiver,
  ReceiverEvent,
  ReceiverMultipleAckError,
} from "@slack/bolt";
import { Logger, ConsoleLogger, LogLevel } from "@slack/logger";
import { AwsCallback } from "@slack/bolt/dist/receivers/AwsLambdaReceiver";
import { SQSEvent, SQSHandler } from "aws-lambda";

export interface SqsEventReceiverOptions {
  logger?: Logger;
  logLevel?: LogLevel;
}

export class SqsEventReceiver implements Receiver {
  private app?: App;
  private logger: Logger;

  public constructor({
    logger = undefined,
    logLevel = LogLevel.INFO,
  }: SqsEventReceiverOptions = {}) {
    this.logger =
      logger ??
      (() => {
        const defaultLogger = new ConsoleLogger();
        defaultLogger.setLevel(logLevel);
        return defaultLogger;
      })();
  }

  public init(app: App): void {
    this.app = app;
  }

  public start(..._args: any[]): Promise<SQSHandler> {
    return new Promise((resolve, reject) => {
      try {
        const handler = this.toHandler();
        resolve(handler);
      } catch (error) {
        reject(error);
      }
    });
  }

  public stop(..._args: any[]): Promise<void> {
    return new Promise((resolve, _reject) => {
      resolve();
    });
  }

  public toHandler(): SQSHandler {
    return async (
      sqsEvent: SQSEvent,
      _awsContext: any,
      _awsCallback: AwsCallback
    ): Promise<void> => {
      this.logger.debug(`SQS event: ${JSON.stringify(sqsEvent, null, 2)}`);

      const rawBody = this.getRawBody(sqsEvent);

      const eventBody: any = this.parseEventBody(rawBody, this.logger);

      // Setup ack timeout warning
      let isAcknowledged = false;

      // Structure the ReceiverEvent
      let storedResponse;
      const event: ReceiverEvent = {
        body: eventBody.body,
        ack: async (response) => {
          if (isAcknowledged) {
            throw new ReceiverMultipleAckError();
          }
          isAcknowledged = true;
          if (typeof response === "undefined" || response == null) {
            storedResponse = "";
          } else {
            storedResponse = response;
          }
        },
        retryNum: eventBody.retryNum,
        retryReason: eventBody.retryReason,
        customProperties: eventBody.customProperties,
      };

      // Send the event to the app for processing
      try {
        this.logger.debug(`Receiver event: ${JSON.stringify(event, null, 2)}`);
        await this.app?.processEvent(event);
      } catch (err) {
        this.logger.error(
          "An unhandled error occurred while Bolt processed an event"
        );
        this.logger.debug(
          `Error details: ${err}, storedResponse: ${storedResponse}`
        );
      }
    };
  }

  private getRawBody(sqsEvent: SQSEvent): string {
    return sqsEvent.Records[0]?.body;
  }

  private parseEventBody(stringBody: string, logger: Logger): any {
    try {
      return JSON.parse(stringBody);
    } catch (e) {
      logger.error(`Failed to parse body as JSON data`);
      throw e;
    }
  }
}
