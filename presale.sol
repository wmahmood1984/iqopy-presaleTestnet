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

    function approve(address _spender, uint256 _amount) external returns (bool);


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

    mapping(address => uint256) public bnbReferralRewards;
    uint256 public totalBNBOwedToReferrers;

    uint public ExchangeListed;

    AggregatorV3Interface public priceFeedbnb;

    uint256 public amountRaisedBNB;
    uint256 public amountRaisedBUSD;
    uint256 public rewardLimit = 200000000 * (10**18);
    uint256 public rewardDistributed;
    uint256 public presaleStartTime ;
    uint           oneYear = 60*60*24*365;
    uint           oneMonth = 60*60*24*30;
    uint256 public tokenPrice;
    uint256 public tokensSold;


    struct UserInfo {
        uint256 buyToken;
        uint256 unlockabletoken;
        uint256 unlockTokenAmount;
        uint256 tokenLockTime;
        uint256 rewardDistributed;
        uint256 rewardEligibility;
    }

    mapping(address => UserInfo[]) private userPurchases;
    mapping(address => uint256) public userBalance;

    uint256 public LOCK_PERIOD = 300;
    uint256 public MONTHLY_UNLOCK_PERCENT = 5;

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


    function setTokenPrice(uint256 _tokenPrice) external onlyOwner {
        tokenPrice = _tokenPrice;
    }

    function tokenForSale() public view returns (uint256) {
        return token.allowance(owner(), address(this));
    }

    function buyTokenBNB(address referrer) external payable {
        require(presaleStartTime>0, "Presale is not active");
        require(msg.value > 0, "Invalid amount");
        uint256 numberOfTokens = bnbToToken(msg.value);
        uint256 tokenValue = tokenForSale();
        require(tokenValue >= numberOfTokens, "Insufficient tokens for sale");

        tokensSold += numberOfTokens;
        amountRaisedBNB += msg.value;

        // Record the buyer's purchase with vesting details
        UserInfo memory newPurchase = UserInfo(
            numberOfTokens,0,
            0,
            block.timestamp,
            0,
            0
        );
        userPurchases[msg.sender].push(newPurchase);
        userBalance[msg.sender] += numberOfTokens;

        emit Sell(msg.sender, numberOfTokens);

        // Handle referral rewards
        if (referrer != address(0) && referrer != msg.sender) {
            uint256 bnbReferralReward = (msg.value * 5) / 100;
            uint256 tokenReferralReward = (numberOfTokens * 5) / 100;

            // Update BNB referral rewards
            bnbReferralRewards[referrer] += bnbReferralReward;
            totalBNBOwedToReferrers += bnbReferralReward;

            // Record the referrer's token reward with vesting details
            UserInfo memory referrerReward = UserInfo(
                tokenReferralReward,0,
                0,
                block.timestamp,
                0,
                0
            );
            userPurchases[referrer].push(referrerReward);
            userBalance[referrer] += tokenReferralReward;
        }
    }

    function withdrawBNBReferralRewards() external {
        uint256 reward = bnbReferralRewards[msg.sender];
        require(reward > 0, "No BNB rewards to withdraw");
        bnbReferralRewards[msg.sender] = 0;
        totalBNBOwedToReferrers -= reward;
        payable(msg.sender).transfer(reward);
    }

    function privateSale(uint256 numberOfTokens, address _user)
        public
        onlyOwner
    {
        uint256 tokenValue = tokenForSale();
        require(tokenValue >= numberOfTokens, "Insufficient tokens for sale");

        tokensSold += numberOfTokens;
        //token.transferFrom(owner(), msg.sender, numberOfTokens);

        emit Sell(_user, numberOfTokens);

        UserInfo memory newPurchase = UserInfo(
            numberOfTokens,0,
            0,
            block.timestamp,
            0,
            0
        );
        userPurchases[_user].push(newPurchase);
        userBalance[_user] += numberOfTokens;
    }

    function bulkPrivateSale(
        uint256[] memory _numbers,
        address[] memory _addresses
    ) public onlyOwner {
        for (uint256 i = 0; i < _addresses.length; i++) {
            privateSale(_numbers[i], _addresses[i]);
        }
    }

      function unlockVestedTokens(uint256 index) external {
        uint256 unlockableTokens = calculateUnlockable(msg.sender, index);

        require(unlockableTokens > 0, "No tokens to unlock yet");

        UserInfo[] storage purchases = userPurchases[msg.sender];
        require(index < purchases.length, "Invalid index");
        uint tokenToTransfer = unlockableTokens - purchases[index].unlockTokenAmount;
        token.transferFrom(owner(),msg.sender, tokenToTransfer);

        purchases[index].unlockTokenAmount = unlockableTokens;
        userBalance[msg.sender] -= tokenToTransfer;

        emit TokensVested(msg.sender, tokenToTransfer);
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
       

        UserInfo[] storage purchases = userPurchases[beneficiary];
        require(index < purchases.length, "Invalid index");

        uint256 vested = purchases[index].buyToken;
        uint256 lockTimeInd = purchases[index].tokenLockTime-presaleStartTime ;
        

        uint256 elapsedMonths;



        if (ExchangeListed==0) {
            return 0;
        }

        if((ExchangeListed+oneYear)>block.timestamp){
            elapsedMonths = 0;
        }else if((ExchangeListed+oneYear+lockTimeInd)>block.timestamp) {
            elapsedMonths = 0;
        }else{
            elapsedMonths = (block.timestamp - (ExchangeListed+oneYear+lockTimeInd))/oneMonth;
        }



        // uint256 elapsedMonths = (currentTimestamp - ExchangeListed-lockTimeInd) /
        //     60;
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
        returns (UserInfo[] memory)
    {
        UserInfo[] memory userInfo = new UserInfo[](
            userPurchases[_user].length
        );

        for (uint256 i = 0; i < userPurchases[_user].length; i++) {
            userInfo[i] = UserInfo(
                userPurchases[_user][i].buyToken,
                calculateUnlockable(_user,i),
                userPurchases[_user][i].unlockTokenAmount,
                userPurchases[_user][i].tokenLockTime,
                userPurchases[_user][i].rewardDistributed,
                calcStake(_user, i)
            );
        }

        return userInfo;
    }

    function withdrawReward(uint256 _index) public {
        address _user = msg.sender;
        uint256 numberOfTokens = calcStake(_user, _index) -
            userPurchases[_user][_index].rewardDistributed;
        if ((rewardDistributed) > rewardLimit) {
            return;
        } else if ((rewardDistributed + numberOfTokens) > rewardLimit) {
            token.transferFrom(owner(), _user, rewardLimit - rewardDistributed);
            userPurchases[_user][_index].rewardDistributed += (rewardLimit -
                rewardDistributed);
        } else {
            token.transferFrom(owner(), _user, numberOfTokens);
            userPurchases[_user][_index].rewardDistributed += numberOfTokens;
        }
    }

    function getUserPurchaseCount(address _user)
        external
        view
        returns (uint256)
    {
        return userPurchases[_user].length;
    }

    function withdrawBNB(uint256 amount) external onlyOwner {
        uint256 availableBNB = address(this).balance - totalBNBOwedToReferrers;
        require(amount <= availableBNB, "Insufficient balance");
        payable(msg.sender).transfer(amount);
    }

    function withdrawAllBNB() external onlyOwner {
        uint256 availableBNB = address(this).balance - totalBNBOwedToReferrers;
        require(availableBNB > 0, "No BNB available to withdraw");
        payable(msg.sender).transfer(availableBNB);
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

    function calcStake(address user, uint256 index)
        public
        view
        returns (uint256)
    {
        // if (stake[user].startTimestamp == 0) {
        //     return 0;
        // }

        uint256 amountA = userPurchases[user][index].buyToken -
            userPurchases[user][index].unlockTokenAmount;
        //        uint256 amountB = getUserAirdrop(user);
        //        uint256 amount = (amountA + amountB);

         uint256 currentTimestamp = block.timestamp;
        uint256 lockTimeInd = userPurchases[user][index].tokenLockTime-presaleStartTime ;


        if (ExchangeListed==0) {
            return 0;
        }


        if(lockTimeInd>(currentTimestamp - ExchangeListed)){
            return 0;
        }

        uint256 monthsPassed = (currentTimestamp - ExchangeListed-lockTimeInd) /
            oneMonth;

       
        uint256 totalUnlockable = (amountA * 2 * monthsPassed) / 100;
        uint256 usStakeAble = totalUnlockable;

        if (usStakeAble == 0) {
            return 0;
        }

        return usStakeAble;
    }

    function setTradingStart() public onlyOwner {
        presaleStartTime  = block.timestamp;
    }

    function setListedOnExchange() public onlyOwner {
        ExchangeListed = block.timestamp;
    }
}
