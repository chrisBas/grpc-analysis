package main

import (
	"context"
	"fmt"
	"server/pb/example"
	"time"

	"github.com/google/uuid"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/metadata"
	"google.golang.org/grpc/status"
)

type exampleServer struct{
	example.UnimplementedExampleServer
}

func newExampleServer() example.ExampleServer {
	return new(exampleServer)
}

func (* exampleServer) ExampleUnaryCall(ctx context.Context, req *example.ExampleRequest) (*example.ExampleReply, error) {
	return &example.ExampleReply{Msg: "echo: " + req.Msg}, nil
}
func (* exampleServer) ExampleStreamingCall(req *example.ExampleRequest, stream example.Example_ExampleStreamingCallServer) error {
	ctx := stream.Context()
	if header, ok := metadata.FromIncomingContext(ctx); ok {
		if v, ok := header["error"]; ok {
			return status.Errorf(codes.InvalidArgument, "error metadata: %v", v)
		}
	}
	// this will be sent immediately
	err := stream.SendHeader(metadata.New(map[string]string{
		"REQUEST_ID": uuid.NewString(),
	}))
	if err != nil {
		return nil
	}

	for i := 1; i <= 5; i++ {
		stream.Send(&example.ExampleReply{Msg: fmt.Sprintf("echo: %s (%d)", req.Msg, i)})
		time.Sleep(time.Millisecond * 500)
	}

	// not needed, but will be send with the final response code when the stream is closed
	stream.SetTrailer(metadata.New(map[string]string{
		"status": "ok",
	}))

	// return nil to close stream successfully
	return nil
}