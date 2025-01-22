import { ExampleRequest } from "generated";
import { ExampleClient } from "generated/ExampleServiceClientPb";
import { useState } from "react";

const exampleClient = new ExampleClient("http://localhost:8080", null, null);

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
          const req = new ExampleRequest();
          req.setMsg(userInput);
          exampleClient.exampleUnaryCall(req, null, (err, resp) => {
            if (err) {
              console.log({
                fn: "exampleUnaryCall",
                event: "error",
                data: err,
              });
              return;
            }
            console.log({
              fn: "exampleUnaryCall",
              event: "success",
              data: resp.toObject(),
            });
            setGrpcResponse(resp.getMsg());
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
          const req = new ExampleRequest();
          req.setMsg(userInput);
          const stream = exampleClient.exampleStreamingCall(req);
          setGrpcStreamResponse([]);
          stream.on("data", (resp) => {
            setGrpcStreamResponse((prev) => [...prev, resp.getMsg()]);
            console.log({
              fn: "exampleStreamingCall",
              event: "data",
              data: resp,
            });
          });
          stream.on("status", (status) => {
            console.log({
              fn: "exampleStreamingCall",
              event: "status",
              data: status,
            });
          });
          stream.on("error", (err) => {
            console.log({
              fn: "exampleStreamingCall",
              event: "error",
              data: err,
            });
          });
          stream.on("end", () => {
            console.log({
              fn: "exampleStreamingCall",
              event: "end",
              data: null,
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
