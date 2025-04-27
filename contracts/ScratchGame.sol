// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./ScratchToken.sol";
import "./NFTBadge.sol";

contract ScratchGame is Ownable {
    ScratchToken public token;
    NFTBadge public badge;
    
    // Card types and their prices
    enum CardType { BASIC, SILVER, GOLD, PLATINUM }
    mapping(CardType => uint256) public cardPrices;
    
    // User stats
    struct UserStats {
        uint256 cardsScratched;
        uint256 totalWinnings;
        bool hasBronzeBadge;
        bool hasSilverBadge;
        bool hasGoldBadge;
    }
    
    mapping(address => UserStats) public userStats;
    
    // Events
    event CardPurchased(address indexed user, CardType cardType, uint256 price);
    event CardScratched(address indexed user, CardType cardType, uint256 prize);
    event BadgeMinted(address indexed user, NFTBadge.BadgeType badgeType);
    
    constructor(address initialOwner, address tokenAddress, address badgeAddress) 
        Ownable(initialOwner) 
    {
        token = ScratchToken(tokenAddress);
        badge = NFTBadge(badgeAddress);
        
        // Set initial card prices
        cardPrices[CardType.BASIC] = 10 * 10**18;     // 10 tokens
        cardPrices[CardType.SILVER] = 25 * 10**18;    // 25 tokens
        cardPrices[CardType.GOLD] = 50 * 10**18;      // 50 tokens
        cardPrices[CardType.PLATINUM] = 100 * 10**18; // 100 tokens
    }
    
    // Update card prices (only owner)
    function setCardPrice(CardType cardType, uint256 price) public onlyOwner {
        cardPrices[cardType] = price;
    }
    
    // Buy a scratch card
    function buyCard(CardType cardType) public {
        uint256 price = cardPrices[cardType];
        require(token.balanceOf(msg.sender) >= price, "Insufficient token balance");
        
        // Transfer tokens from user to contract
        require(token.transferFrom(msg.sender, address(this), price), "Token transfer failed");
        
        emit CardPurchased(msg.sender, cardType, price);
    }
    
    // Scratch a card and reveal prize
    // This would typically use a verifiable random function in production
    function scratchCard(CardType cardType, uint256 userProvidedSeed) public returns (uint256) {
        // Generate pseudo-random number (not secure for production)
        uint256 randomValue = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            msg.sender,
            userProvidedSeed
        )));
        
        // 40% chance of winning
        bool isWin = randomValue % 100 < 40;
        
        uint256 prize = 0;
        if (isWin) {
            // Calculate prize based on card type
            if (cardType == CardType.BASIC) {
                prize = (randomValue % 31) * 10**18; // 0-30 tokens
            } else if (cardType == CardType.SILVER) {
                prize = (5 + (randomValue % 71)) * 10**18; // 5-75 tokens
            } else if (cardType == CardType.GOLD) {
                prize = (10 + (randomValue % 141)) * 10**18; // 10-150 tokens
            } else if (cardType == CardType.PLATINUM) {
                prize = (20 + (randomValue % 281)) * 10**18; // 20-300 tokens
            }
            
            // Transfer prize tokens to user
            if (prize > 0) {
                token.transfer(msg.sender, prize);
                userStats[msg.sender].totalWinnings += prize;
            }
        }
        
        // Update user stats
        userStats[msg.sender].cardsScratched += 1;
        
        // Check if user is eligible for badges
        checkBadgeEligibility(msg.sender);
        
        emit CardScratched(msg.sender, cardType, prize);
        return prize;
    }
    
    // Check if user is eligible for badges
    function checkBadgeEligibility(address user) internal {
        UserStats storage stats = userStats[user];
        
        // Bronze badge (10 cards)
        if (!stats.hasBronzeBadge && stats.cardsScratched >= 10) {
            stats.hasBronzeBadge = true;
        }
        
        // Silver badge (50 cards)
        if (!stats.hasSilverBadge && stats.cardsScratched >= 50) {
            stats.hasSilverBadge = true;
        }
        
        // Gold badge (100 cards)
        if (!stats.hasGoldBadge && stats.cardsScratched >= 100) {
            stats.hasGoldBadge = true;
        }
    }
    
    // Mint badge NFT (user must be eligible)
    function mintBadge(NFTBadge.BadgeType badgeType, string memory tokenURI) public {
        UserStats storage stats = userStats[msg.sender];
        
        if (badgeType == NFTBadge.BadgeType.BRONZE) {
            require(stats.hasBronzeBadge, "Not eligible for Bronze badge");
            require(token.balanceOf(msg.sender) >= 50 * 10**18, "Need 50 tokens to mint Bronze badge");
            require(token.transferFrom(msg.sender, address(this), 50 * 10**18), "Token transfer failed");
        } else if (badgeType == NFTBadge.BadgeType.SILVER) {
            require(stats.hasSilverBadge, "Not eligible for Silver badge");
            require(token.balanceOf(msg.sender) >= 150 * 10**18, "Need 150 tokens to mint Silver badge");
            require(token.transferFrom(msg.sender, address(this), 150 * 10**18), "Token transfer failed");
        } else if (badgeType == NFTBadge.BadgeType.GOLD) {
            require(stats.hasGoldBadge, "Not eligible for Gold badge");
            require(token.balanceOf(msg.sender) >= 300 * 10**18, "Need 300 tokens to mint Gold badge");
            require(token.transferFrom(msg.sender, address(this), 300 * 10**18), "Token transfer failed");
        }
        
        // Mint the badge NFT
        badge.mintBadge(msg.sender, badgeType, tokenURI);
        
        emit BadgeMinted(msg.sender, badgeType);
    }
    
    // Withdraw tokens (only owner)
    function withdrawTokens(uint256 amount) public onlyOwner {
        require(token.balanceOf(address(this)) >= amount, "Insufficient balance");
        token.transfer(owner(), amount);
    }
}
