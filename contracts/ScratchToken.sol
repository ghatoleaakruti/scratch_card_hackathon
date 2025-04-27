// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ScratchToken is ERC20, Ownable {
    constructor(address initialOwner) 
        ERC20("ScratchToken", "SCRATCH") 
        Ownable(initialOwner) 
    {
        // Mint 1,000,000 tokens to the contract creator
        _mint(msg.sender, 1_000_000 * 10 ** decimals());
    }

    // Function to mint new tokens (only owner)
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    // Function to burn tokens
    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }
}
