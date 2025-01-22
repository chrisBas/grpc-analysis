const {
  ExampleRequest,
  ExampleResponse,
} = require("./pb/example/example_pb.js");
const { ExampleClient } = require("./pb/example/example_grpc_web_pb.js");

var client = new ExampleClient("http://" + window.location.hostname + ":8080", null, null);

// This is so the GRPC Chrome Plugin can be used to debug the client
// TODO: this should be turned off optionally (in prod, maybe dev) via a build flag
const enableDevTools = window.__GRPCWEB_DEVTOOLS__ || (() => {});
enableDevTools([client]);

function makeUnaryRequest(msg) {
  var request = new ExampleRequest();
  request.setMsg(msg);
  
  client.exampleUnaryCall(request, {}, (err, resp) => {
    if (err) {
      console.log({fn: 'exampleUnaryCall', event: 'error', data: err})
    } else {
      console.log({fn: 'exampleUnaryCall', event: 'success', data: resp.toObject()})
    }
  });
}
makeUnaryRequest("test")

function makeStreamingRequest(msg) {
  var streamRequest = new ExampleRequest();
  streamRequest.setMsg(msg);
  
  var stream = client.exampleStreamingCall(streamRequest, {});
  stream.on("data", (resp) => {
    console.log({fn: 'exampleStreamingCall', event: 'data', data: resp.toObject()})
  });
  stream.on("end", (resp) => {
    // TODO: try and get this to trigger AND check if other events exist (beyond data, status, error, and maybe end)
    console.log({fn: 'exampleStreamingCall', event: 'end', data: resp})
  });
  stream.on("status", (resp) => {
    // resp will be like: {code: 0, details: "", metadata: {'status': 'ok'}} where code 0 is OK (the metadata.status is app-specific and not part of the grpc-web spec)
    console.log({fn: 'exampleStreamingCall', event: 'status', data: resp})
  });
  stream.on("error", (err) => {
    console.log({fn: 'exampleStreamingCall', event: 'error', data: err})
  });  
}
makeStreamingRequest("test")