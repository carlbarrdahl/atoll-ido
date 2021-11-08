//SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/math/SafeCast.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "hardhat/console.sol";

import "./VestingWallet.sol";

contract IDO is VestingWallet, AccessControl, Ownable {
    using SafeERC20 for IERC20;
    using SafeMath for uint64;
    using SafeMath for uint96;
    using SafeMath for uint256;
    using SafeCast for uint256;
    using SafeCast for uint48;

    event Stake(address indexed wallet, uint256 amount, uint256 date);
    event Withdraw(address indexed wallet, uint256 amount, uint256 date);
    event Claimed(address indexed wallet, uint256 amount, uint256 date);

    uint256 public totalStaked;
    uint256 public vestingPeriod;
    uint256 public rewardPeriod;
    IERC20 public stakingToken;
    IERC20 public rewardToken;

    struct User {
        uint256 stakeTime;
        uint256 stakeAmount;
        uint256 claimedRewards;
    }

    mapping(address => User) public users;

    constructor(
        IERC20 _stakingToken,
        IERC20 _rewardToken,
        uint64 _vestingPeriod
    ) VestingWallet(address(this), uint64(block.timestamp), _vestingPeriod) {
        require(
            _vestingPeriod < 90 days,
            "Vesting period must be under 90 days"
        );
        stakingToken = _stakingToken;
        rewardToken = _rewardToken;
        vestingPeriod = _vestingPeriod;
        rewardPeriod = _vestingPeriod + 90 days;
    }

    function stake(uint256 _amount) external returns (uint256) {
        require(_amount > 0, "Amount must be over 0");

        // Record when user stakes
        User storage user = users[msg.sender];
        user.stakeAmount += _amount;
        user.stakeTime = block.timestamp;

        totalStaked += _amount;
        IERC20(stakingToken).safeTransferFrom(
            msg.sender,
            address(this),
            _amount
        );

        emit Stake(msg.sender, _amount, block.timestamp);

        return _amount;
    }

    function withdraw(uint256 amount) external returns (uint256) {
        // Calculate to see if user is allowed to withdraw
        User storage user = users[msg.sender];
        require(
            block.timestamp >= user.stakeTime + vestingPeriod,
            "Tokens still locked"
        );

        user.stakeAmount -= amount;
        totalStaked -= amount;

        IERC20(stakingToken).safeTransfer(msg.sender, amount);

        emit Withdraw(msg.sender, amount, block.timestamp);
        return amount;
    }

    function claim() external returns (uint256) {
        User storage user = users[msg.sender];
        require(
            block.timestamp >= user.stakeTime + vestingPeriod,
            "Tokens still locked"
        );

        uint256 amount = user.stakeAmount * 2; // Just return 2x the amount as staked for now

        user.stakeTime = block.timestamp;
        user.claimedRewards += amount;

        IERC20(rewardToken).safeTransfer(msg.sender, amount);
        emit Claimed(msg.sender, amount, block.timestamp);

        return amount;
    }

    function calculateReward(address wallet) public view returns (uint256) {
        // User storage user = users[wallet];
    }
}
