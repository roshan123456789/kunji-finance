// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

interface ITradingAdapter {

    function init() external;
    function createTrade(string memory tradeType, bytes[] memory args) external;
    
} 