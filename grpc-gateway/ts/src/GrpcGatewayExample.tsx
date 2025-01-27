import { useState } from "react";
import { Observable } from "rxjs";
import {
  Api,
  CommonCommonReply,
  CommonCommonRequest,
  CommonCommonType,
  ExampleExampleReply,
  ExampleExampleRequest,
  HttpResponse,
  RequestParams,
  RpcStatus,
} from "./pb/api";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const LARGE_MESSAGE = "a".repeat(1000000);
const exampleClient = new Api({
  baseUrl: "http://localhost:8080",
});
const commonStreamingCall = streamToObservable(
  exampleClient.exampleExample.exampleCommonStreamingCall
);

export function GrpcGatewayExample() {
  const [userInput, setUserInput] = useState("echo msg");
  const [grpcResponse, setGrpcResponse] = useState("");
  const [grpcStreamResponse, setGrpcStreamResponse] = useState<string[]>([]);
  const [grpcWebsocketStreamResponse, setGrpcWebsocketStreamResponse] =
    useState<ExampleExampleReply[]>([]);
  const [sockets, setSockets] = useState<WebSocket[]>([]);

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
          const makeStreamCall = (
            id: number,
            onMsgCallBack?: (reply: CommonCommonReply) => void
          ) => {
            const req: CommonCommonRequest = {
              msg: userInput,
              type: CommonCommonType.JSON,
            };
            const startTime = new Date().getTime();
            commonStreamingCall(req).subscribe({
              next: (resp) => {
                onMsgCallBack?.(resp);
                console.log({
                  fn: "commonStreamingCall",
                  event: "data",
                  id,
                  data: resp,
                });
              },
              complete: () => {
                console.log(
                  `Completion Time: ${new Date().getTime() - startTime}`
                );
                console.log({
                  fn: "commonStreamingCall",
                  event: "end",
                  id,
                  data: null,
                });
              },
              error: (err) => {
                console.log({
                  fn: "commonStreamingCall",
                  event: "error",
                  id,
                  data: err,
                });
              },
            });
          };
          setGrpcStreamResponse([]);
          makeStreamCall(0, (resp) => {
            setGrpcStreamResponse((prev) => [...prev, resp.msg || ""]);
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
        style={{
          marginBottom: "30px",
          backgroundColor: sockets.length === 0 ? "green" : "red",
        }}
        onClick={() => {
          if (sockets.length === 0) {
            for (let i = 1; i <= 1; i++) {
              const socket = new WebSocket(
                "ws://localhost:8080/example.Example/ExampleStreamingCall?method=POST"
              );

              // Handle connection open
              socket.onopen = () => {
                console.log({
                  fn: "example.Example/ExampleStreamingCall",
                  event: "onopen",
                  data: null,
                  socket: i,
                });
                const req: ExampleExampleRequest = {
                  msg: userInput,
                };
                socket.send(JSON.stringify(req));
              };

              // Handle incoming messages
              socket.onmessage = (event) => {
                console.log({
                  fn: "example.Example/ExampleStreamingCall",
                  event: "onmessage",
                  data: event.data,
                  socket: i,
                });
                setGrpcWebsocketStreamResponse((prev) => [
                  ...prev,
                  JSON.parse(event.data).result,
                ]);
              };

              // Handle connection errors
              socket.onerror = (error) => {
                console.log({
                  fn: "example.Example/ExampleStreamingCall",
                  event: "onerror",
                  data: error,
                  socket: i,
                });
              };

              // Handle connection close
              socket.onclose = () => {
                console.log({
                  fn: "example.Example/ExampleStreamingCall",
                  event: "onclose",
                  data: null,
                  socket: i,
                });
                setSockets((prev) => prev.filter((s) => s !== socket));
                setGrpcWebsocketStreamResponse([]);
              };
              setSockets((prev) => [...prev, socket]);
            }
          } else {
            sockets.forEach((socket) => socket.close());
          }
        }}
      >
        {sockets.length === 0
          ? "Connect to GRPC Websocket Stream"
          : "Disonnect to GRPC Websocket Stream"}
      </button>
      <div>
        <button
          style={{ marginBottom: "30px" }}
          onClick={() => {
            const req: ExampleExampleRequest = {
              msg: userInput,
            };
            sockets.forEach((socket) => {
              socket.send(JSON.stringify(req));
            });
          }}
          disabled={sockets.length === 0}
        >
          Send Message to Websocket Stream
        </button>
      </div>
      <div style={{ marginBottom: "30px" }}>
        <div>{`Websocket Stream Response:`}</div>
        {grpcWebsocketStreamResponse.map((res, i) => {
          return <div key={i}>{res.msg}</div>;
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
