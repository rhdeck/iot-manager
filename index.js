const { Iot, STS, IotData } = require("aws-sdk");
const { v4: uuid } = require("uuid");
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
var endPoint = null;
const getIOTEndpoint = async () => {
  if (endPoint === null) {
    const iot = new Iot();
    const { endpointAddress } = await iot.describeEndpoint().promise();
    endPoint = endpointAddress;
  }
  return endPoint;
};
var iotdata = null;
const getIOTData = async () => {
  if (iotdata === null) {
    const ep = await getIOTEndpoint();
    iotdata = new IotData({ endpoint: ep });
  }
  return iotdata;
};
const sendIOTMessage = async (topic, message) => {
  const i = await getIOTData();
  return i.publish({ topic, payload: message, qos: 0 }).promise();
};

module.exports = { sendIOTMessage, getIOT };
