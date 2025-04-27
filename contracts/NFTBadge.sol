// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFTBadge is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    
    // Badge types
    enum BadgeType { BRONZE, SILVER, GOLD }
    
    // Mapping from token ID to badge type
    mapping(uint256 => BadgeType) public badgeTypes;
    
    // Base URI for metadata
    string private _baseTokenURI;
    
    // Authorized minters
    mapping(address => bool) public authorizedMinters;
    
    constructor(address initialOwner, string memory baseTokenURI) 
        ERC721("ScratchBadge", "SBADGE") 
        Ownable(initialOwner) 
    {
        _baseTokenURI = baseTokenURI;
        authorizedMinters[initialOwner] = true;
    }
    
    // Modifier to check if caller is authorized to mint
    modifier onlyAuthorizedMinter() {
        require(authorizedMinters[msg.sender] || owner() == msg.sender, "Not authorized to mint");
        _;
    }
    
    // Add or remove authorized minters
    function setAuthorizedMinter(address minter, bool authorized) public onlyOwner {
        authorizedMinters[minter] = authorized;
    }
    
    // Set base URI for metadata
    function setBaseURI(string memory baseTokenURI) public onlyOwner {
        _baseTokenURI = baseTokenURI;
    }
    
    // Override base URI function
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }
    
    // Mint a new badge
    function mintBadge(address to, BadgeType badgeType, string memory tokenURI) 
        public 
        onlyAuthorizedMinter 
        returns (uint256) 
    {
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        _mint(to, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        badgeTypes[newTokenId] = badgeType;
        
        return newTokenId;
    }
    
    // Get badge type for a token
    function getBadgeType(uint256 tokenId) public view returns (BadgeType) {
        require(_exists(tokenId), "Token does not exist");
        return badgeTypes[tokenId];
    }
}
