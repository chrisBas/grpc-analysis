import { GrpcWebFetchTransport } from "@protobuf-ts/grpcweb-transport";
import { useState } from "react";
import { CommonReply, CommonRequest, CommonType } from "./generated/common";
import { ExampleRequest } from "./generated/example";
import { ExampleClient } from "./generated/example.client";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const LARGE_MESSAGE = "a".repeat(1000000);
const transport = new GrpcWebFetchTransport({
  baseUrl: "http://localhost:8090",
});
const exampleClient = new ExampleClient(transport);

export function GrpcWebExample() {
  const [userInput, setUserInput] = useState("echo msg");
  const [grpcResponse, setGrpcResponse] = useState("");
  const [grpcStreamResponse, setGrpcStreamResponse] = useState<
    (number | string)[]
  >([]);

  return (
    <div>
      <div style={{ marginBottom: "30px" }}>
        <input
          type="text"
          value={userInput}
          onChange={(e) => {
            setUserInput(e.target.value);
          }}
        />
      </div>
      <button
        style={{ marginBottom: "30px" }}
        onClick={() => {
          const req: CommonRequest = { msg: userInput, type: CommonType.TEXT };
          exampleClient
            .commonUnaryCall(req)
            .then((resp) => {
              const reply = resp.response;
              console.log({
                fn: "commonUnaryCall",
                event: "success",
                data: reply,
              });
              setGrpcResponse(reply.msg);
            })
            .catch((err) => {
              console.log({
                fn: "commonUnaryCall",
                event: "error",
                data: err,
              });
            });
        }}
      >
        GRPC Unary RPC Call
      </button>
      <div
        style={{ marginBottom: "30px" }}
      >{`Unary Response: ${grpcResponse}`}</div>
      <button
        style={{ marginBottom: "30px" }}
        onClick={() => {
          const makeStreamCall = (
            id: number,
            onMsgCallBack?: (reply: CommonReply) => void
          ) => {
            const startTime = new Date().getTime();
            const req: CommonRequest = {
              msg: LARGE_MESSAGE,
              type: CommonType.TEXT,
            };
            const stream = exampleClient.commonStreamingCall(req);
            stream.responses.onMessage((resp) => {
              console.log({
                fn: "commonStreamingCall",
                event: "data",
                id,
                data: resp,
              });
              onMsgCallBack?.(resp);
            });
            stream.responses.onComplete(() => {
              console.log(
                `Completion Time: ${new Date().getTime() - startTime}`
              );
              console.log({
                fn: "commonStreamingCall",
                event: "end",
                id,
                data: null,
              });
            });
            stream.responses.onError((err) => {
              console.log({
                fn: "commonStreamingCall",
                event: "error",
                id,
                data: err,
              });
            });
          };
          setGrpcStreamResponse([]);
          makeStreamCall(0, (resp) => {
            setGrpcStreamResponse((prev) => [...prev, resp.type]);
          });
          // see how many more streams can be opened (on Edge: version 132.0.2957.127 this caps at 6)
          // for (let i = 1; i < 10; i++) {
          //   makeStreamCall(i);
          // }
        }}
      >
        GRPC Stream RPC Call
      </button>
      <div style={{ marginBottom: "30px" }}>
        <div>{`Stream Response:`}</div>
        {grpcStreamResponse.map((res, i) => {
          return <div key={i}>{res}</div>;
        })}
      </div>
      <button
        style={{ marginBottom: "30px" }}
        onClick={() => {
          const bidiStream = exampleClient.exampleStreamingCall();
          bidiStream.responses.onMessage((resp) => {
            console.log({
              fn: "exampleStreamingCall",
              event: "data",
              data: resp,
            });
          });
          bidiStream.responses.onComplete(() => {
            console.log({
              fn: "exampleStreamingCall",
              event: "end",
              data: null,
            });
          });
          bidiStream.responses.onError((err) => {
            console.log({
              fn: "exampleStreamingCall",
              event: "error",
              data: err,
            });
          });
          const req: ExampleRequest = {
            msg: "bidi stream",
          };
          bidiStream.requests.send(req);
        }}
      >
        GRPC Bidi Stream (NOT SUPPORTED IN GRPC-WEB)
      </button>
    </div>
  );
}
