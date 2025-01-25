# TS2 Docs

This directory is intended to display a grpc-web ts client example with generated code from protoc with the grpc out option "--grpc-web_out import_style=typescript".

## Info

Using Vite + GRPC Web there are some neuances to the setup.  In particular, the generated files need to live in their own library and be imported into the main project via a link (see package.json dependency "generated: "file:generated")

## References

- [GRPC-Web Vite](https://github.com/a2not/vite-grpc-web/tree/main)