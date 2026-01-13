// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract BaseTimeLockVault {
    struct Deposit {
        uint256 amount;
        uint256 unlockTime;
    }

    mapping(address => Deposit) public deposits;

    event Deposited(address indexed user, uint256 amount, uint256 unlockTime);
    event Withdrawn(address indexed user, uint256 amount);

    function deposit(uint256 lockDurationSeconds) external payable {
        require(msg.value > 0, "Must deposit ETH");
        require(deposits[msg.sender].amount == 0, "Active deposit already exists");

        uint256 unlockTime = block.timestamp + lockDurationSeconds;
        deposits[msg.sender] = Deposit(msg.value, unlockTime);

        emit Deposited(msg.sender, msg.value, unlockTime);
    }

    function withdraw() external {
        Deposit memory userDeposit = deposits[msg.sender];
        require(userDeposit.amount > 0, "No active deposit");
        require(block.timestamp >= userDeposit.unlockTime, "Funds are still locked");

        delete deposits[msg.sender];
        payable(msg.sender).transfer(userDeposit.amount);

        emit Withdrawn(msg.sender, userDeposit.amount);
    }

    function getDeposit(address user)
        external
        view
        returns (uint256 amount, uint256 unlockTime)
    {
        Deposit memory d = deposits[user];
        return (d.amount, d.unlockTime);
    }
}
