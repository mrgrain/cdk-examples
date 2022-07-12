import { Handler } from "aws-lambda";
import S3 from "aws-sdk/clients/s3";
import axios from "axios";

interface Input {
  status?: string;
}

export const handler: Handler<Input, string> = async ({ status = "200" }) => {
  const BUCKET_NAME = process.env.BUCKET_NAME!;

  const cat = await axios.get(`https://http.cat/${status}`, {
    responseType: "stream",
  });

  const response = await new S3()
    .upload({
      Bucket: BUCKET_NAME,
      Key: status,
      Body: cat.data,
      ContentType: "image/jpeg",
    })
    .promise();

  return response.Location;
};
