import { GrpcWebFetchTransport } from "@protobuf-ts/grpcweb-transport";
import { CommonReply, CommonRequest, CommonType } from "./generated/common";
import { ExampleClient } from "./generated/example.client";

const LARGE_MESSAGE = "a".repeat(1000000);
const SMALL_MESSAGE = "a".repeat(10);

const transport = new GrpcWebFetchTransport({
  baseUrl: "http://localhost:8090",
});
const exampleClient = new ExampleClient(transport);

function makeStreamkingCall(msg: string) {
  const startTime = new Date().getTime();
  let count = 0;
  const req: CommonRequest = {
    msg: msg,
    type: CommonType.TEXT,
  };
  const stream = exampleClient.commonStreamingCall(req);
  stream.responses.onMessage((resp) => {
    count++;
    console.log({
      fn: "commonStreamingCall",
      event: "data",
      data: count,
    });
  });
  stream.responses.onComplete(() => {
    console.log(`Completion Time: ${new Date().getTime() - startTime}ms`);
    console.log({
      fn: "commonStreamingCall",
      event: "end",
      data: null,
    });
  });
  stream.responses.onError((err) => {
    console.log({
      fn: "commonStreamingCall",
      event: "error",
      data: err,
    });
  });
}

function binaryToBase64(uint8Array: Uint8Array): string {
    // Convert the Uint8Array to a binary string using a loop
    let binaryString = '';
    for (let i = 0; i < uint8Array.length; i++) {
      binaryString += String.fromCharCode(uint8Array[i]);
    }
  
    // Encode the binary string to Base64
    return btoa(binaryString);
}

function base64ToBinary(base64String: string): Uint8Array {
  // Decode the Base64 string to a binary string
  const binaryString = atob(base64String);

  // Convert the binary string to a Uint8Array
  const uint8Array = new Uint8Array(binaryString.length);

  // Fill the Uint8Array with values from the binary string
  for (let i = 0; i < binaryString.length; i++) {
    uint8Array[i] = binaryString.charCodeAt(i);
  }

  return uint8Array;
}

function checkTimeToDeserializeNMessages(n: number) {
  const startTime = new Date().getTime();
  const req: CommonReply = {
    msg: LARGE_MESSAGE,
    type: CommonType.TEXT,
  };
  const binReq = CommonReply.toBinary(req);
  const b64Bin = binaryToBase64(binReq);
  for (let i = 0; i < n; i++) {
    const binReq = base64ToBinary(b64Bin);
    const resp = CommonReply.fromBinary(binReq);
    console.log({
      fn: "commonStreamingCall",
      event: "data",
      count: i,
      data: resp.type,
    });
  }
  console.log(
    `Time to deserialize ${n} messages: ${new Date().getTime() - startTime}ms`
  );
}

if (false) {
  makeStreamkingCall(SMALL_MESSAGE);
  makeStreamkingCall(LARGE_MESSAGE);
}

checkTimeToDeserializeNMessages(1000);
