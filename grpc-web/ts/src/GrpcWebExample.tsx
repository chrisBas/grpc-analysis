import { CommonRequest, CommonType } from "generated";
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
          const req = new CommonRequest();
          req.setMsg(userInput);
          req.setType(CommonType.JSON);
          exampleClient.commonUnaryCall(req, null, (err, resp) => {
            if (err) {
              console.log({
                fn: "commonUnaryCall",
                event: "error",
                data: err,
              });
              return;
            }
            console.log({
              fn: "commonUnaryCall",
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
          const req = new CommonRequest();
          req.setMsg(userInput);
          req.setType(CommonType.JSON);
          const stream = exampleClient.commonStreamingCall(req);
          setGrpcStreamResponse([]);
          stream.on("data", (resp) => {
            setGrpcStreamResponse((prev) => [...prev, resp.getMsg()]);
            console.log({
              fn: "commonStreamingCall",
              event: "data",
              data: resp.toObject(),
            });
          });
          stream.on("status", (status) => {
            console.log({
              fn: "commonStreamingCall",
              event: "status",
              data: status,
            });
          });
          stream.on("error", (err) => {
            console.log({
              fn: "commonStreamingCall",
              event: "error",
              data: err,
            });
          });
          stream.on("end", () => {
            console.log({
              fn: "commonStreamingCall",
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
