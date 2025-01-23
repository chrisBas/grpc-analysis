package main

import (
	"context"
	"flag"
	"fmt"
	"net/http"

	"github.com/grpc-ecosystem/grpc-gateway/v2/runtime"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
	"google.golang.org/grpc/grpclog"

	gw "gateway/pb/gateway"
)
  
  var (
	// command-line options:
	// gRPC server endpoint
	grpcServerEndpoint = flag.String("grpc-server-endpoint",  "localhost:9090", "gRPC server endpoint")
  )
  
  func run() error {
	ctx := context.Background()
	ctx, cancel := context.WithCancel(ctx)
	defer cancel()
  
	// Register gRPC server endpoint
	// Note: Make sure the gRPC server is running properly and accessible
	mux := runtime.NewServeMux()
	opts := []grpc.DialOption{grpc.WithTransportCredentials(insecure.NewCredentials())}
	err := gw.RegisterExampleHandlerFromEndpoint(ctx, mux,  *grpcServerEndpoint, opts)
	if err != nil {
	  return err
	}
  
	// Start HTTP server (and proxy calls to gRPC server endpoint)
	port := 8080
	fmt.Printf("Server is listening on port %d\n", port)
	return http.ListenAndServe(fmt.Sprintf(":%d", port), middleware(mux))
  }

  func middleware(next http.Handler) http.Handler {
	return cors(next)
}

  func cors(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// if allowedOrigin(r.Header.Get("Origin")) {
		w.Header().Set("Access-Control-Allow-Origin", r.Header.Get("Origin"))
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, Authorization, ResponseType")
		// }
		if r.Method == "OPTIONS" {
			return
		}
		h.ServeHTTP(w, r)
	})
  }
  
  func main() {
	flag.Parse()
  
	if err := run(); err != nil {
	  grpclog.Fatal(err)
	}
  }