//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token is ERC20 {
    constructor(uint256 initialBalance) ERC20("Atoll", "ATL") {
        console.log("Mint", initialBalance);
        _mint(msg.sender, initialBalance);
    }
}
