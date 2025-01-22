import { ExampleRequest } from "generated";
import { ExampleClient } from "generated/ExampleServiceClientPb";
import { useState } from "react";

const exampleClient = new ExampleClient("http://localhost:8080", null, null);

export function GrpcWebExample() {
  const [userInput, setUserInput] = useState("echo msg");
  const [grpcResponse, setGrpcResponse] = useState("");

  return (
    <div>
      <div style={{ marginBottom: "40px" }}>
        <input
          type="text"
          value={userInput}
          onChange={(e) => {
            setUserInput(e.target.value);
          }}
        />
      </div>
      <button
        style={{ marginBottom: "20px" }}
        onClick={() => {
          const req = new ExampleRequest();
          req.setMsg("Test");
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
        GRPC Unary RPC Example
      </button>
      <div>{`Response: ${grpcResponse}`}</div>
    </div>
  );
}
