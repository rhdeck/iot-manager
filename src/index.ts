import { Iot, STS, IotData } from "aws-sdk";
import { v4 as uuid } from "uuid";
//#region IOT
let iot;
let sts;
const getIOT = async ({ RoleArn, region, topic, id }) => {
  if (!region) region = process.env.AWS_REGION || "us-east-1";
  if (!iot) iot = new Iot();
  if (!sts) sts = new STS();
  const { endpointAddress } = await iot
    .describeEndpoint({
      endpointType: "iot:Data-ATS",
    })
    .promise();
  const params = {
    RoleArn,
    RoleSessionName: uuid(),
  };
  const {
    Credentials: { AccessKeyId, SecretAccessKey, SessionToken },
  } = await sts.assumeRole(params).promise();
  return {
    id: id,
    host: endpointAddress,
    accessKeyId: AccessKeyId,
    secretKey: SecretAccessKey,
    sessionToken: SessionToken,
    region,
    topic,
  };
};
var endPoint: string | undefined;
const getIOTEndpoint = async (): Promise<string> => {
  if (!endPoint) {
    const iot = new Iot();
    const { endpointAddress } = await iot.describeEndpoint().promise();
    endPoint = endpointAddress;
  }
  return endPoint!;
};
var iotdata: IotData | undefined;
const getIOTData = async (): Promise<IotData> => {
  if (!iotdata) {
    const ep = await getIOTEndpoint();
    iotdata = new IotData({ endpoint: ep });
  }
  return iotdata!;
};
const sendIOTMessage = async (topic, message) => {
  const i = await getIOTData();
  return i.publish({ topic, payload: message, qos: 0 }).promise();
};

export { sendIOTMessage, getIOT };
