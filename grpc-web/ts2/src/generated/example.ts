/* eslint-disable */
// @generated by protobuf-ts 2.9.4 with parameter eslint_disable
// @generated from protobuf file "example.proto" (package "example", syntax proto3)
// tslint:disable
import { ServiceType } from "@protobuf-ts/runtime-rpc";
import type { BinaryWriteOptions } from "@protobuf-ts/runtime";
import type { IBinaryWriter } from "@protobuf-ts/runtime";
import { WireType } from "@protobuf-ts/runtime";
import type { BinaryReadOptions } from "@protobuf-ts/runtime";
import type { IBinaryReader } from "@protobuf-ts/runtime";
import { UnknownFieldHandler } from "@protobuf-ts/runtime";
import type { PartialMessage } from "@protobuf-ts/runtime";
import { reflectionMergePartial } from "@protobuf-ts/runtime";
import { MessageType } from "@protobuf-ts/runtime";
/**
 * @generated from protobuf message example.ExampleRequest
 */
export interface ExampleRequest {
    /**
     * @generated from protobuf field: string msg = 1;
     */
    msg: string;
}
/**
 * @generated from protobuf message example.ExampleReply
 */
export interface ExampleReply {
    /**
     * @generated from protobuf field: string msg = 1;
     */
    msg: string;
}
// @generated message type with reflection information, may provide speed optimized methods
class ExampleRequest$Type extends MessageType<ExampleRequest> {
    constructor() {
        super("example.ExampleRequest", [
            { no: 1, name: "msg", kind: "scalar", T: 9 /*ScalarType.STRING*/ }
        ]);
    }
    create(value?: PartialMessage<ExampleRequest>): ExampleRequest {
        const message = globalThis.Object.create((this.messagePrototype!));
        message.msg = "";
        if (value !== undefined)
            reflectionMergePartial<ExampleRequest>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: ExampleRequest): ExampleRequest {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* string msg */ 1:
                    message.msg = reader.string();
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message: ExampleRequest, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* string msg = 1; */
        if (message.msg !== "")
            writer.tag(1, WireType.LengthDelimited).string(message.msg);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message example.ExampleRequest
 */
export const ExampleRequest = new ExampleRequest$Type();
// @generated message type with reflection information, may provide speed optimized methods
class ExampleReply$Type extends MessageType<ExampleReply> {
    constructor() {
        super("example.ExampleReply", [
            { no: 1, name: "msg", kind: "scalar", T: 9 /*ScalarType.STRING*/ }
        ]);
    }
    create(value?: PartialMessage<ExampleReply>): ExampleReply {
        const message = globalThis.Object.create((this.messagePrototype!));
        message.msg = "";
        if (value !== undefined)
            reflectionMergePartial<ExampleReply>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: ExampleReply): ExampleReply {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* string msg */ 1:
                    message.msg = reader.string();
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message: ExampleReply, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* string msg = 1; */
        if (message.msg !== "")
            writer.tag(1, WireType.LengthDelimited).string(message.msg);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message example.ExampleReply
 */
export const ExampleReply = new ExampleReply$Type();
/**
 * @generated ServiceType for protobuf service example.Example
 */
export const Example = new ServiceType("example.Example", [
    { name: "ExampleUnaryCall", options: {}, I: ExampleRequest, O: ExampleReply },
    { name: "ExampleStreamingCall", serverStreaming: true, options: {}, I: ExampleRequest, O: ExampleReply }
]);
