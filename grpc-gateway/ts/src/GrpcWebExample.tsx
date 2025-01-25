import { useState } from "react";
import { Observable } from "rxjs";
import {
  Api,
  CommonCommonRequest,
  CommonCommonType,
  HttpResponse,
  RequestParams,
  RpcStatus,
} from "./pb/api";

const exampleClient = new Api({
  baseUrl: "http://localhost:8080",
});
const commonStreamingCall = streamToObservable(
  exampleClient.exampleExample.exampleCommonStreamingCall
);

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
          const req: CommonCommonRequest = {
            msg: userInput,
            type: CommonCommonType.JSON,
          };
          exampleClient.exampleExample
            .exampleCommonUnaryCall(req)
            .then((resp) => resp.data)
            .then((resp) => {
              console.log({
                fn: "commonUnaryCall",
                event: "success",
                data: resp,
              });
              setGrpcResponse(resp.msg || "");
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
          const req: CommonCommonRequest = {
            msg: userInput,
            type: CommonCommonType.JSON,
          };
          setGrpcStreamResponse([]);
          commonStreamingCall(req).subscribe({
            next: (resp) => {
              setGrpcStreamResponse((prev) => [...prev, resp?.msg || ""]);
              console.log({
                fn: "commonStreamingCall",
                event: "data",
                data: resp,
              });
            },
            complete: () => {
              console.log({
                fn: "commonStreamingCall",
                event: "end",
                data: null,
              });
            },
            error: (err) => {
              console.log({
                fn: "commonStreamingCall",
                event: "error",
                data: err,
              });
            },
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

function streamToObservable<T, R>(
  streamFn: (
    body: T,
    params?: RequestParams
  ) => Promise<
    HttpResponse<
      {
        result?: R;
        error?: RpcStatus;
      },
      RpcStatus
    >
  >
): (body: T, params?: RequestParams) => Observable<R> {
  return (body: T, params?: RequestParams) => {
    return new Observable<R>((sub) => {
      // ********** IMPORTANT NOTE: explicitely setting format to undefined allows us to process the response in our own way **********
      // This is necessary to handle streaming responses properly
      streamFn(body, { ...params, format: undefined })
        .then(async (resp) => {
          // Get the response body as a readable stream
          const reader = resp.body?.getReader();

          if (reader) {
            const decoder = new TextDecoder("utf-8");
            let buffer: string | undefined = "";
            while (true) {
              // Read chunks from the stream
              const { done, value } = await reader.read();

              // Break the loop if stream ends
              if (done) {
                break;
              }

              // Decode the chunk into a string
              buffer += decoder.decode(value, { stream: true });

              // Split into individual lines (or objects if NDJSON)
              const lines: string[] = buffer?.split("\n") || [];

              // Keep the last incomplete line in the buffer
              buffer = lines?.pop();

              // Process each complete line
              for (const line of lines) {
                if (line.trim()) {
                  // Handle each streamed object
                  const jsonObject = JSON.parse(line);
                  sub.next(jsonObject.result);
                }
              }
            }
            sub.complete();
          } else {
            sub.error(new Error("No reader available for the response body."));
          }
        })
        .catch((err) => {
          sub.error(err);
        });
    });
  };
}
