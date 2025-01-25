import { GrpcWebFetchTransport } from "@protobuf-ts/grpcweb-transport";
import { useState } from "react";
import { ExampleRequest } from "./generated/example";
import { ExampleClient } from "./generated/example.client";

const transport = new GrpcWebFetchTransport({
  baseUrl: "http://localhost:8080",
});
const exampleClient = new ExampleClient(transport);

export function GrpcWebExample() {
  const [userInput, setUserInput] = useState("echo msg");
  const [grpcResponse, setGrpcResponse] = useState("");
  const [grpcStreamResponse, setGrpcStreamResponse] = useState<string[]>([]);

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
          const req: ExampleRequest = { msg: userInput };
          exampleClient
            .exampleUnaryCall(req)
            .then((resp) => {
              const reply = resp.response;
              console.log({
                fn: "exampleUnaryCall",
                event: "success",
                data: reply,
              });
              setGrpcResponse(reply.msg);
            })
            .catch((err) => {
              console.log({
                fn: "exampleUnaryCall",
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
          const req: ExampleRequest = { msg: userInput };
          const stream = exampleClient.exampleStreamingCall(req);
          setGrpcStreamResponse([]);
          stream.responses.onMessage((resp) => {
            console.log({
              fn: "exampleStreamingCall",
              event: "data",
              data: resp,
            });
            setGrpcStreamResponse((prev) => [...prev, resp.msg]);
          });
          stream.responses.onComplete(() => {
            console.log({
              fn: "exampleStreamingCall",
              event: "end",
              data: null,
            });
          });
          stream.responses.onError((err) => {
            console.log({
              fn: "exampleStreamingCall",
              event: "error",
              data: err,
            });
          });
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
    </div>
  );
}
