// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

interface IRouter {
    function approvePlugin(address _plugin) external;
    function swap(address[] memory _path, uint256 _amountIn, uint256 _minOut, address _receiver) external;
    function increasePosition(address[] memory _path, address _indexToken, uint256 _amountIn, uint256 _minOut, uint256 _sizeDelta, bool _isLong, uint256 _price) external;
    function decreasePosition(address _collateralToken, address _indexToken, uint256 _collateralDelta, uint256 _sizeDelta, bool _isLong, address _receiver, uint256 _price) external;
}