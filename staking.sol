// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

interface IAirdrop {
    function getUserAirdrop(address user) external view returns (uint256);
}

interface IperSale {
    function getUserBalance(address user) external view returns (uint256);
}

interface IERC20 {
    function transfer(address recipient, uint256 amount)
        external
        returns (bool);
        function balanceOf(address account) external view returns (uint256);
}

contract IQopyStaking is Ownable {
    IERC20 public IQopy;
    IperSale public perSale;
    IAirdrop public airdrop;

    struct stakeInfo {
        uint256 startTimestamp;
        uint256 released;
        bool stake;
    }

    mapping(address => stakeInfo) public stake;

    constructor(IERC20 _token) {

            // address _perSaleContract,
        // address _airdropContract
        perSale = IperSale(0x31f995ef85f2A94B9198FAfaf5D7196776884aFb);
        airdrop = IAirdrop(0x96733816791402919750c2caD50894A53cd86E2e);
        IQopy = _token;
    }

    function stakeTokens(address _user) external {
        require(!stake[_user].stake, "User already staked");
        stake[_user].startTimestamp = block.timestamp;
        stake[_user].stake = true;
    }

    function stopStake(address _user) external {
        require(stake[_user].stake, "User has not staked");
        stake[_user].startTimestamp = 0;
        stake[_user].stake = false;
    }

    function setPerSaleContract(address _perSaleContract) external onlyOwner {
        require(_perSaleContract != address(0), "Invalid perSale contract address");
        perSale = IperSale(_perSaleContract);
    }

    function setAirdropContract(address _airdropContract) external onlyOwner {
        require(_airdropContract != address(0), "Invalid airdrop contract address");
        airdrop = IAirdrop(_airdropContract);
    }

    function setIQopyAddress(address _iqopyAddress) external onlyOwner {
        require(_iqopyAddress != address(0), "Invalid IQopy token address");
        IQopy = IERC20(_iqopyAddress);
    }

    function getUserAirdrop(address user) public view returns (uint256) {
        return airdrop.getUserAirdrop(user);
    }

    function getUserBala(address user) public view returns (uint256) {
        return perSale.getUserBalance(user);
    }

    function withdraw() public {
        require(stake[msg.sender].stake, "Please stake first");
        uint256 releasable = calcStake(msg.sender);
        require(releasable > 0, "Nothing to withdraw");

        stake[msg.sender].released += releasable;

        require(IQopy.transfer(msg.sender, releasable), "Transfer failed");
    }

    function withdrawToken(uint256 amount) public {
    require(amount > 0, "Amount must be greater than 0");
    require(IQopy.balanceOf(address(this)) >= amount, "Insufficient contract balance");

    require(IQopy.transfer(msg.sender, amount), "Transfer failed");
}


    function calcStake(address user) public view returns (uint256) {
        if (stake[user].startTimestamp == 0) {
            return 0;
        }

        uint256 amountA = getUserBala(user);
        uint256 amountB = getUserAirdrop(user);
        uint256 amount = (amountA + amountB);

        uint256 monthsPassed = (block.timestamp - stake[user].startTimestamp) / 60;
        uint256 totalUnlockable = (amount * 2 * monthsPassed) / 100;
        uint256 usStakeAble = totalUnlockable - stake[user].released;

        if (usStakeAble == 0) {
            return 0;
        }

        return usStakeAble;
    }
}