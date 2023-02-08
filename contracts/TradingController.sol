// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import {ITradingAdapter} from "./interfaces/ITradingAdapter.sol";

contract TradingController {

    struct AdapterData {
        address contractAddress;
        string[] tradeOperations;
    }

    mapping(string => AdapterData) public tradingPlatformNametoData;
    mapping(address => bool) public whiteListedTraders;
    address public maintainer;

    constructor() {
        maintainer = msg.sender;
    }

    modifier onlyMaintainer {
        require(msg.sender == maintainer, "Only Maintainer");
        _;
    }

    modifier onlyWhitelistedTraders {
        require(whiteListedTraders[msg.sender] == true);
        _;
    }    

    function addNewAdapter(address contractAddress, string memory platformName, string[] memory tradeOperations) external onlyMaintainer {
        tradingPlatformNametoData[platformName] = AdapterData(contractAddress, tradeOperations);
        ITradingAdapter(contractAddress).init();
    }

    function createTrade(string memory platformName, string memory tradingOperation, bytes[] memory args) external onlyWhitelistedTraders {
        ITradingAdapter(tradingPlatformNametoData[platformName].contractAddress).createTrade(tradingOperation, args);
    } 
}