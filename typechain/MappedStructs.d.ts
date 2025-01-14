/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import {
  ethers,
  EventFilter,
  Signer,
  BigNumber,
  BigNumberish,
  PopulatedTransaction,
  BaseContract,
  ContractTransaction,
  Overrides,
  CallOverrides,
} from "ethers";
import { BytesLike } from "@ethersproject/bytes";
import { Listener, Provider } from "@ethersproject/providers";
import { FunctionFragment, EventFragment, Result } from "@ethersproject/abi";
import { TypedEventFilter, TypedEvent, TypedListener } from "./commons";

interface MappedStructsInterface extends ethers.utils.Interface {
  functions: {
    "addItem(string,address,uint256,uint16,bool)": FunctionFragment;
    "addrToUintMap(address)": FunctionFragment;
    "getItemAddr(uint16)": FunctionFragment;
    "getItemValForAddress(address)": FunctionFragment;
    "itemCount()": FunctionFragment;
    "itemMap(uint256)": FunctionFragment;
    "uintToAddrMap(uint256)": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "addItem",
    values: [string, string, BigNumberish, BigNumberish, boolean]
  ): string;
  encodeFunctionData(
    functionFragment: "addrToUintMap",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "getItemAddr",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "getItemValForAddress",
    values: [string]
  ): string;
  encodeFunctionData(functionFragment: "itemCount", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "itemMap",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "uintToAddrMap",
    values: [BigNumberish]
  ): string;

  decodeFunctionResult(functionFragment: "addItem", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "addrToUintMap",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getItemAddr",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getItemValForAddress",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "itemCount", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "itemMap", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "uintToAddrMap",
    data: BytesLike
  ): Result;

  events: {};
}

export class MappedStructs extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  listeners<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter?: TypedEventFilter<EventArgsArray, EventArgsObject>
  ): Array<TypedListener<EventArgsArray, EventArgsObject>>;
  off<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  on<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  once<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  removeListener<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  removeAllListeners<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>
  ): this;

  listeners(eventName?: string): Array<Listener>;
  off(eventName: string, listener: Listener): this;
  on(eventName: string, listener: Listener): this;
  once(eventName: string, listener: Listener): this;
  removeListener(eventName: string, listener: Listener): this;
  removeAllListeners(eventName?: string): this;

  queryFilter<EventArgsArray extends Array<any>, EventArgsObject>(
    event: TypedEventFilter<EventArgsArray, EventArgsObject>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEvent<EventArgsArray & EventArgsObject>>>;

  interface: MappedStructsInterface;

  functions: {
    addItem(
      _str: string,
      _addr: string,
      _uint256: BigNumberish,
      _uint16: BigNumberish,
      _bool: boolean,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    addrToUintMap(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    getItemAddr(
      index: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[string]>;

    getItemValForAddress(
      _addr: string,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    itemCount(overrides?: CallOverrides): Promise<[BigNumber]>;

    itemMap(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<
      [string, string, BigNumber, number, boolean] & {
        _string: string;
        _address: string;
        _uint256: BigNumber;
        _uint16: number;
        _bool: boolean;
      }
    >;

    uintToAddrMap(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[string]>;
  };

  addItem(
    _str: string,
    _addr: string,
    _uint256: BigNumberish,
    _uint16: BigNumberish,
    _bool: boolean,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  addrToUintMap(arg0: string, overrides?: CallOverrides): Promise<BigNumber>;

  getItemAddr(index: BigNumberish, overrides?: CallOverrides): Promise<string>;

  getItemValForAddress(
    _addr: string,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  itemCount(overrides?: CallOverrides): Promise<BigNumber>;

  itemMap(
    arg0: BigNumberish,
    overrides?: CallOverrides
  ): Promise<
    [string, string, BigNumber, number, boolean] & {
      _string: string;
      _address: string;
      _uint256: BigNumber;
      _uint16: number;
      _bool: boolean;
    }
  >;

  uintToAddrMap(arg0: BigNumberish, overrides?: CallOverrides): Promise<string>;

  callStatic: {
    addItem(
      _str: string,
      _addr: string,
      _uint256: BigNumberish,
      _uint16: BigNumberish,
      _bool: boolean,
      overrides?: CallOverrides
    ): Promise<void>;

    addrToUintMap(arg0: string, overrides?: CallOverrides): Promise<BigNumber>;

    getItemAddr(
      index: BigNumberish,
      overrides?: CallOverrides
    ): Promise<string>;

    getItemValForAddress(
      _addr: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    itemCount(overrides?: CallOverrides): Promise<BigNumber>;

    itemMap(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<
      [string, string, BigNumber, number, boolean] & {
        _string: string;
        _address: string;
        _uint256: BigNumber;
        _uint16: number;
        _bool: boolean;
      }
    >;

    uintToAddrMap(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<string>;
  };

  filters: {};

  estimateGas: {
    addItem(
      _str: string,
      _addr: string,
      _uint256: BigNumberish,
      _uint16: BigNumberish,
      _bool: boolean,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    addrToUintMap(arg0: string, overrides?: CallOverrides): Promise<BigNumber>;

    getItemAddr(
      index: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getItemValForAddress(
      _addr: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    itemCount(overrides?: CallOverrides): Promise<BigNumber>;

    itemMap(arg0: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;

    uintToAddrMap(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    addItem(
      _str: string,
      _addr: string,
      _uint256: BigNumberish,
      _uint16: BigNumberish,
      _bool: boolean,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    addrToUintMap(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getItemAddr(
      index: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getItemValForAddress(
      _addr: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    itemCount(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    itemMap(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    uintToAddrMap(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;
  };
}
