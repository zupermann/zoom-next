"use strict";
/*

 * source       https://github.com/mickys/zoom-next/
 * @name        Zoom Core
 * @package     ZoomNext
 * @author      Micky Socaci <micky@binarzone.com>
 * @license     MIT
 
 based on https://github.com/ethereum/web3.js/blob/develop/lib/web3/httpprovider.js
*/
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_js_1 = __importDefault(require("crypto-js"));
const ByteArray_1 = __importDefault(require("../utils/ByteArray"));
class Zoom {
    /**
     *
     * @param {options} - ZoomOptions
     */
    constructor(options) {
        this.version = 1;
        this.options = {
            clone_cache: false,
            use_reference_calls: true
        };
        this.cache = {};
        this.calls = {};
        this.callsData = {};
        this.binary = [];
        this.methodSigPointers = [];
        this.addressInAnyResultCache = {};
        if (typeof options !== "undefined") {
            this.options = Object.assign({}, options);
        }
    }
    /**
     * Assign cache and build the binary call
     *
     * @param {cache} - ZoomOptions
     * @returns Buffer containing resulting call
     */
    getZoomCall(cache) {
        if (typeof cache === "undefined") {
            this.cache = this.calls;
            this.calls = {};
        }
        else {
            if (this.options.clone_cache === true) {
                this.cache = Object.assign({}, cache);
            }
            else {
                this.cache = cache;
            }
        }
        // no longer used
        // this.groupCalls();
        this.generateBinaryCalls();
        return Buffer.from(this.addZoomHeader(this.getBinaryCall()), "hex");
    }
    /**
     * Concatenate all binary calls we have into one large string
     * @param data - the string containing all the calls we want to make
     * @returns string
     */
    addZoomHeader(data) {
        const bytes = new ByteArray_1.default(Buffer.alloc(2 + 2 + 2));
        // add version
        bytes.writeUnsignedShort(this.version);
        // add call num
        bytes.writeUnsignedShort(this.binary.length);
        // add expected return size - 0 as it is no longer used
        bytes.writeUnsignedShort(0);
        // add 0x start and return
        return bytes.toString("hex") + data;
    }
    /**
     * Concatenate all binary calls we have into one large string
     * @returns string
     */
    getBinaryCall() {
        // There is a case when a type 2 - type 4 call might reference a later result
        // 
        // This can happen if the user first calls a contract with a hardcoded
        // address which is then found in a result of a call
        // 
        // sort our calls so type 1 are run first, otherwise we might end up with 
        // type 2 - type 4 calls that cannot resolve their "toAddress" references
        // this.binary.sort(function (objA, objB) {
        //     return (objA < objB) ? -1 : (objA > objB) ? 1 : 0;
        // });
        let data = "";
        for (let i = 0; i < this.binary.length; i++) {
            data += this.binary[i].toString("hex");
        }
        return data;
    }
    /**
     * Iterate through our calls and create binaries
     */
    generateBinaryCalls() {
        let callIndex = -1;
        Object.keys(this.cache).forEach((call) => {
            const str = call.split("_");
            // split address from data
            const callToAddress = str[0];
            const callDataString = str[1];
            let count;
            if (typeof str[2] !== "undefined") {
                count = str[2];
            }
            callIndex++;
            // convert our hex string to a buffer so we can actually use it
            const callData = new ByteArray_1.default(Buffer.from(this.removeZeroX(callDataString), "hex"));
            const packet = {
                type: 1,
                dataLength: callData.length,
                resultId: 0,
                offset: 0,
                toAddress: new ByteArray_1.default(Buffer.from(this.removeZeroX(callToAddress), "hex")), // key contains to address
            };
            let _key = (callToAddress + "_" + callDataString).toLowerCase();
            if (count) {
                _key = (callToAddress + "_" + callDataString + "_" + count).toLowerCase();
            }
            const identifier = crypto_js_1.default.MD5(_key);
            if (typeof this.callsData[identifier] !== "undefined") {
                const callType = this.callsData[identifier].type;
                const sig = this.toMethodSignature(callData.toString("hex"));
                // console.log("sig", sig, "callType", callType, "callIndex", callIndex, "callDataString", callDataString, "mapkeys:",  this.callsData[identifier].mapkey);
                if (typeof callType !== "undefined") {
                    if (callType === 2) {
                        // previous call always.
                        const resultId = callIndex - 1;
                        packet.type = 2;
                        packet.toAddress = new ByteArray_1.default(Buffer.alloc(0));
                        packet.resultId = resultId;
                        packet.offset = this.callsData[identifier].resultIndex * 32;
                    }
                    else if (callType === 3) {
                        for (let y = 0; y < this.callsData[identifier].mapkey.length; y++) {
                            this.setMethodSigPointer(this.callsData[identifier].mapkey[y], callIndex);
                        }
                        packet.type = 3;
                    }
                    else if (callType === 4) {
                        // read method sig and find counter
                        const resultId = this.getMethodSigPointer(sig);
                        packet.type = 4;
                        packet.resultId = resultId.toString();
                    }
                    else if (callType === 5) {
                        // read method sig and find counter
                        const resultId = this.getMethodSigPointer(sig);
                        packet.type = 5;
                        packet.resultId = resultId.toString();
                    }
                    else if (callType === 6) {
                        // previous call always.
                        packet.type = 6;
                        packet.resultId = callIndex - 1;
                    }
                }
                this.binary.push(this.createBinaryCallByteArray(packet, callData));
            }
        });
    }
    /**
     * Iterate through our calls and create binaries
     */
    // public generateBinaryCalls_Old() {
    //     // clean our address cache
    //     this.addressInAnyResultCache = {};
    //     let callIndex = -1;
    //     Object.keys(this.calls).forEach((callToAddress) => {
    //         // for each grouped value
    //         this.calls[callToAddress].forEach((callDataString, subIndex) => {
    //             callIndex++;
    //             // convert our hex string to a buffer so we can actually use it
    //             const callData = new ByteArray( Buffer.from(this.removeZeroX(callDataString), "hex") );
    //             const packet: packetFormat = {
    //                 type: 1,
    //                 dataLength: callData.length,
    //                 resultId: 0,
    //                 offset: 0,
    //                 toAddress: new ByteArray( Buffer.from(this.removeZeroX(callToAddress), "hex") ), // key contains to address
    //             };
    //             // if active then try to build type 2 calls
    //             if (this.options.use_reference_calls === true) {
    //                 const { found, callNum, bytePosition } = this.findToAddressInAnyResult(callToAddress);
    //                 if (found === true) {
    //                     packet.type = 2;
    //                     packet.toAddress = new ByteArray(Buffer.alloc(0));
    //                     packet.resultId = callNum.toString();
    //                     packet.offset = bytePosition.toString();
    //                 }
    //             }
    //             const _key = (callToAddress+"_"+callDataString).toLowerCase();
    //             const identifier = CryptoJS.MD5(_key);
    //             const callType = this.callsData[identifier].type;
    //             const sig = this.toMethodSignature(callData.toString("hex"));
    //             // console.log("sig", sig, "callType", callType, "callIndex", callIndex, "callDataString", callDataString);
    //             if(typeof callType !== "undefined" ) {
    //                 if(callType == 3) {
    //                     const mapkey = this.toMethodSignature(this.callsData[identifier].mapkey[0]);
    //                     // read method sig and set internal result id
    //                      this.setMethodSigPointer(mapkey, callIndex);
    //                     packet.type = 3;
    //                 } else if(callType == 4) {
    //                     // read method sig and find counter
    //                     const resultId = this.getMethodSigPointer(sig);
    //                     packet.type = 4;
    //                     // console.log("??? sig ", sig);
    //                     // console.log("resultId", resultId);
    //                     packet.resultId = resultId.toString();
    //                 }
    //             }
    //             this.binary.push(this.createBinaryCallByteArray(packet, callData));
    //         });
    //     });
    // }
    setMethodSigPointer(sig, nr) {
        this.methodSigPointers[sig] = nr;
    }
    getMethodSigPointer(sig) {
        return this.methodSigPointers[sig];
    }
    /**
     * create binary call byte array
     *
     * @param packet - {@link (packetFormat:interface)}
     * @param callData - Buffer containing method sha and hex encoded parameter values
     * @returns {ByteArray}
     */
    createBinaryCallByteArray(packet, callData) {
        const bytes = new ByteArray_1.default(Buffer.alloc(8));
        // - 1 normal 
        // - 2 to address is result of a previous call
        // - 3 first uint256 parameter is result of a previous call
        // - 4 reset view internal counter
        // 
        // 1 byte - uint8 call type 
        bytes.writeByte(packet.type);
        // 2 bytes - uint16 call_data length
        bytes.writeUnsignedShort(packet.dataLength);
        // 2 bytes - uint16 result_id that holds our call's address or resultCount
        bytes.writeUnsignedShort(packet.resultId);
        // 2 bytes - bytes uint16 offset in bytes where the address starts in said result
        bytes.writeUnsignedShort(packet.offset);
        // 1 empty byte
        bytes.writeByte(0);
        // 20 bytes address / or none if type 2
        bytes.copyBytes(packet.toAddress, 0);
        // 4 bytes method sha + dynamic for the rest 0 to any
        bytes.copyBytes(callData, 0);
        return bytes;
    }
    /**
     * Remove 0x from string then return it
     * @param string
     * @returns string
     */
    removeZeroX(string) {
        return string.replace("0x", "");
    }
    /**
     * Group calls by "to" address
     */
    groupCalls() {
        Object.keys(this.cache).forEach((key) => {
            const parts = key.split("_");
            const toAddress = parts[0];
            const toCall = parts[1];
            if (!this.calls.hasOwnProperty(toAddress)) {
                this.calls[toAddress] = [];
            }
            this.calls[toAddress].push(toCall);
        });
    }
    determineResultPositionByte() {
    }
    /**
     * Search current calls for the "to address" and if found return index and byte offset
     *
     * @param to - the call address
     *
     * @returns { addressInResult }
     */
    findToAddressInAnyResult(to) {
        if (typeof this.addressInAnyResultCache[to] === "undefined") {
            const cleanTo = this.removeZeroX(to);
            const Result = {
                callNum: 0,
                bytePosition: 0,
                found: false,
            };
            Object.keys(this.cache).some((key, index) => {
                const position = this.cache[key].indexOf(cleanTo);
                if (position > -1) {
                    Result.callNum = index;
                    Result.bytePosition = (position - 2) / 2; // adjust for 0x in result
                    Result.found = true;
                    return true;
                }
                return false;
            });
            this.addressInAnyResultCache[to] = Result;
        }
        return this.addressInAnyResultCache[to];
    }
    /**
     * Converts the binary returned by the Zoom Smart contract back into a cache object
     *
     * @param binaryString
     *
     * @returns new cache object
     */
    resultsToCache(callResult, combinedBinaryCall) {
        const newData = {};
        const resultString = this.removeZeroX(callResult[0]);
        const resultOffsets = this.readOffsets(callResult[1]);
        // push resultString length as last offset, so we can the last result
        resultOffsets.push(resultString.length / 2);
        const bytes = new ByteArray_1.default(combinedBinaryCall);
        // Read Zoom Header
        // bypass version ( 2 bytes )
        bytes.advanceReadPositionBy(2);
        // read number of calls ( 2 bytes )
        const callLength = bytes.readUnsignedShort();
        // bypass unused space ( 2 bytes ) so bytes.readPosition is now at call data space.
        bytes.advanceReadPositionBy(2);
        // parse and index results
        const Results = [];
        for (let i = 0; i < callLength; i++) {
            Results.push(resultString.substring(resultOffsets[i] * 2, resultOffsets[i + 1] * 2));
        }
        // console.log("Results", Results)
        for (let i = 0; i < callLength; i++) {
            // 1 byte - uint8 call type ( 1 normal / 2 - to address is result of a previous call )
            const type = bytes.readByte();
            // 2 bytes - uint16 call_data length
            const callDataLength = bytes.readUnsignedShort();
            let toAddress;
            if (type === 1 || type === 3 || type === 4 || type === 5 || type === 6) {
                // bypass 5 bytes used in type 2 for result id and offset and 1 byte for unused space
                bytes.advanceReadPositionBy(5);
                // normal call that contains toAddress and callData
                const AddressByteArray = new ByteArray_1.default(20);
                bytes.readBytes(AddressByteArray, 0, 20);
                toAddress = AddressByteArray.toString("hex");
            }
            else if (type === 2) {
                // referenced call that contains callData, toAddress is in result
                const resultId = bytes.readUnsignedShort();
                const resultOffset = bytes.readUnsignedShort();
                toAddress = Results[resultId].substring(resultOffset * 2, (resultOffset + 20) * 2);
                // bypass unused space ( 1 bytes ) so bytes.readPosition is now at callData space.
                bytes.advanceReadPositionBy(1);
            }
            // console.log("callDataLength", callDataLength, bytes.readPosition, bytes.toString("hex"));
            const callData = new ByteArray_1.default(callDataLength);
            bytes.readBytes(callData, 0, callDataLength);
            // combine our call and data and attach result
            let _key = "0x" + toAddress + "_0x" + callData.toString("hex");
            if (type === 6) {
                let count = 0;
                let _newkey = _key + "_" + count;
                if (typeof newData[_key] === "undefined") {
                    // assign old value to new _0 value
                    const oldData = newData[_key];
                    newData[_key] = count;
                    newData[_newkey] = oldData;
                }
                else {
                    count = ++newData[_key];
                }
                _key = _key + "_" + count;
            }
            newData[_key] = "0x" + Results[i];
        }
        // make sure the result length matches our expected size,
        // otherwise let the user know something went wrong
        if (callLength !== Results.length) {
            throw new Error("Zoom: Result size error, something went wrong.");
        }
        this.lastCallData = newData;
        // console.log("newData", newData);
        return newData;
    }
    toBuffer(string) {
        return Buffer.from(string, "hex");
    }
    readOffsets(binaryString) {
        // strip out 0x
        const cleanBinary = this.removeZeroX(binaryString);
        // convert the result to a byte array so we can process it
        const bytes = new ByteArray_1.default(Buffer.from(cleanBinary, "hex"));
        // divide by 32 bytes to find the number of results we need to read
        const resultLenght = bytes.length / 32;
        const Results = [];
        for (let i = 0; i < resultLenght; i++) {
            // 4 byte - 32 bit uint max = 4,294,967,295
            // provides more than enough 4GB of data in the output buffer
            // so.. offset our read pointer by 28 bytes
            bytes.advanceReadPositionBy(28);
            // then read our offset
            Results.push(bytes.readUnsignedInt());
        }
        return Results;
    }
    /**
     * Add a call to an address
     *
     * @param _contract
     * @param _methodAndParams
     * @param _fullSig
     *
     * @returns call indentifier
     */
    addCall(_contract, _methodAndParams, _fullSig) {
        const methodSig = _contract.interface.encodeFunctionData(..._methodAndParams);
        const _key = (_contract.address + "_" + methodSig).toLowerCase();
        const identifier = crypto_js_1.default.MD5(_key);
        if (typeof this.calls[_key] !== "undefined") {
            throw new Error("key already in use[" + _key + "]");
        }
        this.calls[_key] = "";
        if (typeof _fullSig === "undefined") {
            _fullSig = methodSig;
        }
        this.callsData[identifier] = {
            contract: _contract,
            key: _key,
            fullSig: _fullSig
        };
        return identifier;
    }
    addType4Call(_contract, _methodAndParams, _fullSig) {
        return this.addTypeCall(4, _contract, _methodAndParams, _fullSig);
    }
    addType5Call(_contract, _methodAndParams, _fullSig) {
        return this.addTypeCall(5, _contract, _methodAndParams, _fullSig);
    }
    addTypeCall(_type, _contract, _methodAndParams, _fullSig) {
        const methodSig = _contract.interface.encodeFunctionData(..._methodAndParams);
        const _key = (_contract.address + "_" + methodSig).toLowerCase();
        const identifier = crypto_js_1.default.MD5(_key);
        this.calls[_key] = "";
        if (typeof _fullSig === "undefined") {
            _fullSig = methodSig;
        }
        this.callsData[identifier] = {
            contract: _contract,
            key: _key,
            fullSig: _fullSig,
            type: _type
        };
        return identifier;
    }
    /**
     * Add a special view call
     *
     * @param _contract
     * @param type
     *
     */
    addMappingCountCall(_contract, _methodAndParams, _fullSig, sigs) {
        const methodSig = _contract.interface.encodeFunctionData(..._methodAndParams);
        const _key = (_contract.address + "_" + methodSig).toLowerCase();
        this.calls[_key] = "";
        const identifier = crypto_js_1.default.MD5(_key);
        const _mapkeys = [];
        for (let i = 0; i < sigs.length; i++) {
            const resolveSig = sigs[i].contract.interface.encodeFunctionData(...sigs[i].mapAndParams);
            _mapkeys.push((this.toMethodSignature(resolveSig.toString("hex"))).toLowerCase());
        }
        this.callsData[identifier] = {
            contract: _contract,
            key: _key,
            mapkey: _mapkeys,
            fullSig: methodSig,
            type: 3
        };
        if (_fullSig !== null) {
            this.callsData[identifier].decodeSig = _fullSig;
        }
        return identifier;
    }
    /**
     * Add a special view call
     *
     * @param _contract
     * @param type
     *
     */
    addResultReferenceCall(_contract, _methodAndParams, resultIndex, _fullSig) {
        const methodSig = _contract.interface.encodeFunctionData(..._methodAndParams);
        const _key = (_contract.address + "_" + methodSig).toLowerCase();
        if (typeof _fullSig === "undefined") {
            _fullSig = methodSig;
        }
        let count = 0;
        if (typeof this.calls[_key] === "undefined") {
            this.calls[_key] = count;
        }
        else {
            count = ++this.calls[_key];
        }
        const _newkey = (_contract.address + "_" + methodSig + "_" + count).toLowerCase();
        const oldidentifier = crypto_js_1.default.MD5(_key);
        const identifier = crypto_js_1.default.MD5(_newkey);
        this.calls[_newkey] = "";
        // console.log("_newkey", _newkey, "oldidentifier", oldidentifier.toString(), "identifier", identifier.toString());
        this.callsData[identifier] = {
            contract: _contract,
            key: _key,
            fullSig: _fullSig,
            type: 6,
            resultIndex: resultIndex,
            count: count
        };
        return identifier;
        // const methodSig = _contract.interface.encodeFunctionData(..._methodAndParams);
        // const _key = (_contract.address+"_"+methodSig).toLowerCase();
        // this.calls[_key] = "";
        // const identifier = CryptoJS.MD5(_key);
        // const _mapkeys = [];
        // for(let i = 0; i < sigs.length; i++) {
        //     const resolveSig = sigs[i].contract.interface.encodeFunctionData(...sigs[i].mapAndParams);
        //     _mapkeys.push((this.toMethodSignature(resolveSig.toString("hex"))).toLowerCase());
        // }
        // this.callsData[identifier] = {
        //     contract: _contract,
        //     key: _key,
        //     mapkey: _mapkeys,
        //     fullSig: methodSig,
        //     type: 2,
        //     resultIndex: resultIndex
        // };
        // if(_fullSig !== null) {
        //     this.callsData[identifier].decodeSig = _fullSig;
        // }
        // return identifier;
    }
    /**
     * Decode a call to an address
     *
     * @param identifier
     *
     */
    decodeCall(identifier) {
        const callDetails = this.callsData[identifier];
        let sig = callDetails.fullSig;
        if (typeof callDetails.decodeSig !== "undefined") {
            sig = callDetails.decodeSig;
        }
        if (callDetails.type === 6) {
            const key = callDetails.key + "_" + callDetails.count;
            return callDetails.contract.interface.decodeFunctionResult(sig, this.lastCallData[key]);
        }
        else {
            return callDetails.contract.interface.decodeFunctionResult(sig, this.lastCallData[callDetails.key]);
        }
    }
    /**
     * Read method signature
     *
     * @param calldata
     *
     */
    toMethodSignature(calldata) {
        // strip out 0x
        const cleanBinary = this.removeZeroX(calldata);
        // convert the result to a byte array so we can process it
        const bytes = new ByteArray_1.default(Buffer.from(cleanBinary, "hex"));
        const newBytes = new ByteArray_1.default(Buffer.from(""));
        // copy method signature - 4 bytes
        newBytes.copyBytes(bytes, 0, 4);
        return newBytes.toString("hex");
    }
}
exports.default = Zoom;
;
//# sourceMappingURL=core.js.map