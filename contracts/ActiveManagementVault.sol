// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import {IPlatformAdapter} from "./interfaces/IPlatformAdapter.sol";
import {IActiveManagementVault} from "./interfaces/IActiveManagementVault.sol";

import {BatchedVault} from "./BatchedVault.sol";

contract ActiveManagementVault is BatchedVault, IActiveManagementVault {
    mapping(uint8 => IPlatformAdapter) public platformAdapters;

    function createTrade(IPlatformAdapter.TradeOperation[] memory tradeOperations) external returns(bytes[] memory tradeResults){
        tradeResults = new bytes[](tradeOperations.length);
        for (uint8 i = 0; i < tradeOperations.length; i++) {
            IPlatformAdapter.TradeOperation memory tradeOperation = tradeOperations[i];
            tradeResults[i] = platformAdapters[tradeOperation.platformId].createTrade(tradeOperation);
        }

    }
}