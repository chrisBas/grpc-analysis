package main

import (
	"context"
	"fmt"
	"net"
	"server/pb/example"

	"google.golang.org/grpc"
)

func main() {
	ctx := context.Background()
	port := 9090
	l, err := net.Listen("tcp", fmt.Sprintf(":%d", port))
	if err != nil {
		panic(fmt.Sprintf("failed to listen: %v", err))
	}
	
	s := grpc.NewServer()
	example.RegisterExampleServer(s, newExampleServer())

	go func() {
		defer s.GracefulStop()
		<-ctx.Done()
	}()
	fmt.Printf("Server is listening on port %d\n", port)
	err = s.Serve(l)
	if err != nil {
		panic(fmt.Sprintf("failed to serve: %v", err))
	}
}