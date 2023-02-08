// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import {ITradingAdapter} from "./interfaces/ITradingAdapter.sol";
import {IRouter} from "./interfaces/IRouterGMX.sol";

contract GMX is ITradingAdapter {

    address public controller;
    address public maintainer;
    address public router;

    modifier onlyController {
        require(msg.sender == controller, "Only Controller");
        _;
    }

    modifier onlyMaintainer {
        require(msg.sender == maintainer, "Only Maintainer");
        _;
    }

    constructor(address _maintainer, address _controller) {
        controller = _controller;
        maintainer = _maintainer;
        if(block.chainid == 0xA4B1) {
            router = 0xaBBc5F99639c9B6bCb58544ddf04EFA6802F4064;
        }
    }

    function init() external onlyController {
        if(block.chainid == 0xA4B1) {
            IRouter(router).approvePlugin(0xb87a436B93fFE9D75c5cFA7bAcFff96430b09868);
        }
        
    }

    function createTrade(string memory tradeType, bytes[] memory args) external onlyController {
        if(StringCompare(tradeType, "swap")) {
            _swap(args);
        }
        else if (StringCompare(tradeType, "increasePosition")) {
            _increasePosition(args);
        }
        else if (StringCompare(tradeType, "decreasePosition")) {
            _decreasePosition(args);
        }
    }

    function _swap(bytes[] memory args) internal {
        // TODO
        return;
    }

    function _increasePosition(bytes[] memory args) internal {
        // TODO
        return;
    }

    function _decreasePosition(bytes[] memory args) internal {
        // TODO
        return;
    }

    function StringCompare(string memory a, string memory b) internal pure returns(bool) {
        return keccak256(abi.encodePacked(a)) == keccak256(abi.encodePacked(b));
    }

}
