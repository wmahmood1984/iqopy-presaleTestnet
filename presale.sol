// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @dev Provides information about the current execution context, including the
 * sender of the transaction and its data. While these are generally available
 * via msg.sender and msg.data, they should not be accessed in such a direct
 * manner, since when dealing with meta-transactions the account sending and
 * paying for execution may not be the actual sender (as far as an application
 * is concerned).
 *
 * This contract is only required for intermediate, library-like contracts.
 */
abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }

    function _contextSuffixLength() internal view virtual returns (uint256) {
        return 0;
    }
}

/**
 * @dev Contract module which provides a basic access control mechanism, where
 * there is an account (an owner) that can be granted exclusive access to
 * specific functions.
 *
 * By default, the owner account will be the one that deploys the contract. This
 * can later be changed with {transferOwnership}.
 *
 * This module is used through inheritance. It will make available the modifier
 * `onlyOwner`, which can be applied to your functions to restrict their use to
 * the owner.
 */
abstract contract Ownable is Context {
    address private _owner;

    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );

    /**
     * @dev Initializes the contract setting the deployer as the initial owner.
     */
    constructor() {
        _transferOwnership(_msgSender());
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        _checkOwner();
        _;
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view virtual returns (address) {
        return _owner;
    }

    /**
     * @dev Throws if the sender is not the owner.
     */
    function _checkOwner() internal view virtual {
        require(owner() == _msgSender(), "Ownable: caller is not the owner");
    }

    /**
     * @dev Leaves the contract without owner. It will not be possible to call
     * `onlyOwner` functions. Can only be called by the current owner.
     *
     * NOTE: Renouncing ownership will leave the contract without an owner,
     * thereby disabling any functionality that is only available to the owner.
     */
    function renounceOwnership() public virtual onlyOwner {
        _transferOwnership(address(0));
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(
            newOwner != address(0),
            "Ownable: new owner is the zero address"
        );
        _transferOwnership(newOwner);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Internal function without access restriction.
     */
    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}

interface IToken {
    function totalSupply() external view returns (uint256);

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external returns (bool);

    function balanceOf(address account) external view returns (uint256);

    function allowance(address owner, address spender)
        external
        view
        returns (uint256);

    function transfer(address recipient, uint256 amount)
        external
        returns (bool);

    function decimals() external view returns (uint8);
    function approve(address _spender, uint _amount) external returns(bool);
}

interface AggregatorV3Interface {
    function latestRoundData()
        external
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        );
}

contract IQpoyPresale is Ownable {
    IToken public token;
    //IToken public BUSD;

    AggregatorV3Interface public priceFeedbnb;

    uint256 public amountRaisedBNB;
    uint256 public amountRaisedBUSD;

    uint256 public tokenPrice;
    uint256 public tokensSold;
    bool public presaleActive = true;

    struct UserInfo {
        uint256 buyToken;
        uint256 unlockTokenAmount;
        uint256 tokenLockTime;
        uint256 rewardDistributed;
        uint256 rewardEligibility;
    }

    mapping(address => UserInfo[]) private userPurchases;
    mapping(address => uint256) public userBalance;

    uint256 public LOCK_PERIOD = 300;
    uint256 public MONTHLY_UNLOCK_PERCENT = 2;

    event Sell(address indexed buyer, uint256 amount);
    event TokensVested(address indexed beneficiary, uint256 amount);
    event TokensStaked(
        address indexed staker,
        uint256 amount,
        uint256 lockTime
    );

    constructor(IToken _token) {
        priceFeedbnb = AggregatorV3Interface(
            0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526
        );
        //BUSD = IToken(0x35BD1509a00CE3D6a7969A97cB075e0086A943cB);
        token = _token;
        tokenPrice = 1_000 ether;
    }

    function getLatestPricebnb() public view returns (uint256) {
        (, int256 price, , , ) = priceFeedbnb.latestRoundData();
        return uint256(price);
    }

    function getUserBalance(address user) public view returns (uint256) {
        return userBalance[user];
    }

    function startPresale() external onlyOwner {
        presaleActive = true;
    }

    function stopPresale() external onlyOwner {
        presaleActive = false;
    }

    function setTokenPrice(uint256 _tokenPrice) external onlyOwner {
        tokenPrice = _tokenPrice;
    }

    function tokenForSale() public view returns (uint256) {
        return token.allowance(owner(), address(this));
    }

    function buyTokenBNB() external payable {
        require(presaleActive, "Presale is not active");
        require(msg.value > 0, "valud amount");
        uint256 numberOfTokens = bnbToToken(msg.value);
        uint256 tokenValue = tokenForSale();
        require(tokenValue >= numberOfTokens, "Insufficient tokens for sale");

        tokensSold += numberOfTokens;
        //token.transferFrom(owner(), msg.sender, numberOfTokens);

        emit Sell(msg.sender, numberOfTokens);

        UserInfo memory newPurchase = UserInfo(
            numberOfTokens,
            0,
            block.timestamp,
            0,0
        );
        userPurchases[msg.sender].push(newPurchase);
        userBalance[msg.sender] += numberOfTokens;
    }

    // function buyTokenbusd(uint256 _amount) public {
    //     uint256 numberOfTokens = busdToToken(_amount);
    //     uint256 tokenValue = tokenForSale();
    //     require(tokenValue >= numberOfTokens, "Insufficient tokens for sale");

    //     BUSD.transferFrom(msg.sender, address(this), _amount);

    //     amountRaisedBUSD += _amount;

    //     tokensSold += numberOfTokens;
    //     //token.transferFrom(owner(), msg.sender, numberOfTokens);

    //     emit Sell(msg.sender, numberOfTokens);

    //     UserInfo memory newPurchase = UserInfo(
    //         numberOfTokens,
    //         0,
    //         block.timestamp
    //     );
    //     userPurchases[msg.sender].push(newPurchase);
    //     userBalance[msg.sender] += numberOfTokens;
    // }

    function unlockVestedTokens(uint256 index) external {
        uint256 unlockableTokens = calculateUnlockable(msg.sender, index);

        require(unlockableTokens > 0, "No tokens to unlock yet");

        UserInfo[] storage purchases = userPurchases[msg.sender];
        require(index < purchases.length, "Invalid index");

        token.transfer(msg.sender, unlockableTokens);

        purchases[index].unlockTokenAmount = unlockableTokens;
        userBalance[msg.sender] -= unlockableTokens;

        emit TokensVested(msg.sender, unlockableTokens);
    }

    function busdToToken(uint256 _amount) public view returns (uint256) {
        uint256 totalTokens = (_amount * tokenPrice) / (1 ether);
        uint256 tokens = (totalTokens * (10**token.decimals())) / (1 ether);
        return tokens;
    }

    function bnbToToken(uint256 _amount) public view returns (uint256) {
        uint256 bnbToUsd = (_amount * getLatestPricebnb()) / (1 ether);
        uint256 numberOfTokens = (bnbToUsd * tokenPrice) / 1 ether;
        uint256 tokens = (numberOfTokens * (10**token.decimals())) / 1e8;
        return tokens;
    }

    function calculateUnlockable(address beneficiary, uint256 index)
        public
        view
        returns (uint256)
    {
        if (!presaleActive) {
            return 0;
        }

        UserInfo[] storage purchases = userPurchases[beneficiary];
        require(index < purchases.length, "Invalid index");

        uint256 vested = purchases[index].buyToken;
        uint256 lockTime = purchases[index].tokenLockTime;
        uint256 currentTimestamp = block.timestamp;

        if (lockTime + LOCK_PERIOD > currentTimestamp) {
            return 0;
        }

        uint256 elapsedMonths = (currentTimestamp - (lockTime + LOCK_PERIOD)) /
            60;
        // 30 days;
        uint256 totalUnlockable = (vested *
            MONTHLY_UNLOCK_PERCENT *
            elapsedMonths) / 100;

        if (totalUnlockable > vested) {
            totalUnlockable = vested;
        }

        return totalUnlockable;
    }

    function getUserPurchase(address _user)
        public
        view
        returns (
           UserInfo[] memory 
        )
    {
        UserInfo[] memory userInfo = new UserInfo[](userPurchases[_user].length);

        for(uint i = 0; i < userPurchases[_user].length; i ++){
            userInfo[i] = UserInfo(
                userPurchases[_user][i].buyToken,
                userPurchases[_user][i].unlockTokenAmount,
                userPurchases[_user][i].tokenLockTime,
                userPurchases[_user][i].rewardDistributed,
                calcStake(_user,i)

            );
        }

        return userInfo;
    
    }

    function withdrawReward(uint _index) public {
        address _user = msg.sender;
        uint numberOfTokens = calcStake(_user, _index) - userPurchases[_user][_index].rewardDistributed;
        token.transferFrom(owner(), _user, numberOfTokens);
        userPurchases[_user][_index].rewardDistributed+=numberOfTokens;
    }

    function withdraw(uint _index) public {
        address _user = msg.sender;
        uint numberOfTokens = calcStake(_user, _index) - userPurchases[_user][_index].rewardDistributed;
        token.transferFrom(owner(), _user, numberOfTokens);
        userPurchases[_user][_index].rewardDistributed+=numberOfTokens;
    }

  

    function getUserPurchaseCount(address _user)
        external
        view
        returns (uint256)
    {
        return userPurchases[_user].length;
    }

    function withdrawBNB(uint256 amount) external onlyOwner {
        require(amount <= address(this).balance, "Insufficient balance");
        payable(msg.sender).transfer(amount);
    }

    function withdrawTokens(address _tokenAddress, uint256 _amount)
        external
        onlyOwner
    {
        IToken tokenAddress = IToken(_tokenAddress);
        require(
            tokenAddress.balanceOf(address(this)) >= _amount,
            "Insufficient balance"
        );
        tokenAddress.transfer(owner(), _amount);
    }

    function calcStake(address user,uint index) public view returns (uint256) {
        // if (stake[user].startTimestamp == 0) {
        //     return 0;
        // }

        uint256 amountA = userPurchases[user][index].buyToken;
//        uint256 amountB = getUserAirdrop(user);
//        uint256 amount = (amountA + amountB);

        uint256 monthsPassed = (block.timestamp - userPurchases[user][index].tokenLockTime) / 60;
        uint256 totalUnlockable = (amountA * 2 * monthsPassed) / 100;
        uint256 usStakeAble = totalUnlockable - userPurchases[user][index].unlockTokenAmount;

        if (usStakeAble == 0) {
            return 0;
        }

        return usStakeAble;
    }
}
