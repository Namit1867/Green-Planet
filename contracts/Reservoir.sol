/**
 *Submitted for verification at BscScan.com on 2021-12-02
*/

/**
 *Submitted for verification at BscScan.com on 2021-11-18
*/

/**
 *Submitted for verification at BscScan.com on 2021-11-03
*/

// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

/**
 * @title Reservoir Contract
 * @notice Distributes a token to different contracts at a defined rate.
 * @dev This contract must be poked via the `drip()` function every so often.
 * @author Planet Finance
 */

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
}

abstract contract Ownable is Context {
    address private _owner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev Initializes the contract setting the deployer as the initial owner.
     */
    constructor() {
        _transferOwnership(_msgSender());
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view virtual returns (address) {
        return _owner;
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        require(owner() == _msgSender(), "Ownable: caller is not the owner");
        _;
    }

    /**
     * @dev Leaves the contract without owner. It will not be possible to call
     * `onlyOwner` functions anymore. Can only be called by the current owner.
     *
     * NOTE: Renouncing ownership will leave the contract without an owner,
     * thereby removing any functionality that is only available to the owner.
     */
    function renounceOwnership() public virtual onlyOwner {
        _transferOwnership(address(0));
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
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

/**
 * @dev Interface of the ERC20 standard as defined in the EIP.
 */
interface IERC20 {
    /**
     * @dev Returns the amount of tokens in existence.
     */
    function totalSupply() external view returns (uint256);

    /**
     * @dev Returns the amount of tokens owned by `account`.
     */
    function balanceOf(address account) external view returns (uint256);

    /**
     * @dev Moves `amount` tokens from the caller's account to `recipient`.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transfer(address recipient, uint256 amount) external returns (bool);

    /**
     * @dev Returns the remaining number of tokens that `spender` will be
     * allowed to spend on behalf of `owner` through {transferFrom}. This is
     * zero by default.
     *
     * This value changes when {approve} or {transferFrom} are called.
     */
    function allowance(address owner, address spender) external view returns (uint256);

    /**
     * @dev Sets `amount` as the allowance of `spender` over the caller's tokens.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * IMPORTANT: Beware that changing an allowance with this method brings the risk
     * that someone may use both the old and the new allowance by unfortunate
     * transaction ordering. One possible solution to mitigate this race
     * condition is to first reduce the spender's allowance to 0 and set the
     * desired value afterwards:
     * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     *
     * Emits an {Approval} event.
     */
    function approve(address spender, uint256 amount) external returns (bool);

    /**
     * @dev Moves `amount` tokens from `sender` to `recipient` using the
     * allowance mechanism. `amount` is then deducted from the caller's
     * allowance.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external returns (bool);

    /**
     * @dev Emitted when `value` tokens are moved from one account (`from`) to
     * another (`to`).
     *
     * Note that `value` may be zero.
     */
    event Transfer(address indexed from, address indexed to, uint256 value);

    /**
     * @dev Emitted when the allowance of a `spender` for an `owner` is set by
     * a call to {approve}. `value` is the new allowance.
     */
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

/**
 * @title SafeERC20
 * @dev Wrappers around ERC20 operations that throw on failure (when the token
 * contract returns false). Tokens that return no value (and instead revert or
 * throw on failure) are also supported, non-reverting calls are assumed to be
 * successful.
 * To use this library you can add a `using SafeERC20 for IERC20;` statement to your contract,
 * which allows you to call the safe operations as `token.safeTransfer(...)`, etc.
 */
library SafeERC20 {
    using Address for address;

    function safeTransfer(
        IERC20 token,
        address to,
        uint256 value
    ) internal {
        _callOptionalReturn(token, abi.encodeWithSelector(token.transfer.selector, to, value));
    }

    function safeTransferFrom(
        IERC20 token,
        address from,
        address to,
        uint256 value
    ) internal {
        _callOptionalReturn(token, abi.encodeWithSelector(token.transferFrom.selector, from, to, value));
    }

    /**
     * @dev Deprecated. This function has issues similar to the ones found in
     * {IERC20-approve}, and its usage is discouraged.
     *
     * Whenever possible, use {safeIncreaseAllowance} and
     * {safeDecreaseAllowance} instead.
     */
    function safeApprove(
        IERC20 token,
        address spender,
        uint256 value
    ) internal {
        // safeApprove should only be called when setting an initial allowance,
        // or when resetting it to zero. To increase and decrease it, use
        // 'safeIncreaseAllowance' and 'safeDecreaseAllowance'
        require(
            (value == 0) || (token.allowance(address(this), spender) == 0),
            "SafeERC20: approve from non-zero to non-zero allowance"
        );
        _callOptionalReturn(token, abi.encodeWithSelector(token.approve.selector, spender, value));
    }

    function safeIncreaseAllowance(
        IERC20 token,
        address spender,
        uint256 value
    ) internal {
        uint256 newAllowance = token.allowance(address(this), spender) + value;
        _callOptionalReturn(token, abi.encodeWithSelector(token.approve.selector, spender, newAllowance));
    }

    function safeDecreaseAllowance(
        IERC20 token,
        address spender,
        uint256 value
    ) internal {
        unchecked {
            uint256 oldAllowance = token.allowance(address(this), spender);
            require(oldAllowance >= value, "SafeERC20: decreased allowance below zero");
            uint256 newAllowance = oldAllowance - value;
            _callOptionalReturn(token, abi.encodeWithSelector(token.approve.selector, spender, newAllowance));
        }
    }

    /**
     * @dev Imitates a Solidity high-level call (i.e. a regular function call to a contract), relaxing the requirement
     * on the return value: the return value is optional (but if data is returned, it must not be false).
     * @param token The token targeted by the call.
     * @param data The call data (encoded using abi.encode or one of its variants).
     */
    function _callOptionalReturn(IERC20 token, bytes memory data) private {
        // We need to perform a low level call here, to bypass Solidity's return data size checking mechanism, since
        // we're implementing it ourselves. We use {Address.functionCall} to perform this call, which verifies that
        // the target address contains contract code and also asserts for success in the low-level call.

        bytes memory returndata = address(token).functionCall(data, "SafeERC20: low-level call failed");
        if (returndata.length > 0) {
            // Return data is optional
            require(abi.decode(returndata, (bool)), "SafeERC20: ERC20 operation did not succeed");
        }
    }
}

/**
 * @dev Collection of functions related to the address type
 */
library Address {
    /**
     * @dev Returns true if `account` is a contract.
     *
     * [IMPORTANT]
     * ====
     * It is unsafe to assume that an address for which this function returns
     * false is an externally-owned account (EOA) and not a contract.
     *
     * Among others, `isContract` will return false for the following
     * types of addresses:
     *
     *  - an externally-owned account
     *  - a contract in construction
     *  - an address where a contract will be created
     *  - an address where a contract lived, but was destroyed
     * ====
     *
     * [IMPORTANT]
     * ====
     * You shouldn't rely on `isContract` to protect against flash loan attacks!
     *
     * Preventing calls from contracts is highly discouraged. It breaks composability, breaks support for smart wallets
     * like Gnosis Safe, and does not provide security since it can be circumvented by calling from a contract
     * constructor.
     * ====
     */
    function isContract(address account) internal view returns (bool) {
        // This method relies on extcodesize/address.code.length, which returns 0
        // for contracts in construction, since the code is only stored at the end
        // of the constructor execution.

        return account.code.length > 0;
    }

    /**
     * @dev Replacement for Solidity's `transfer`: sends `amount` wei to
     * `recipient`, forwarding all available gas and reverting on errors.
     *
     * https://eips.ethereum.org/EIPS/eip-1884[EIP1884] increases the gas cost
     * of certain opcodes, possibly making contracts go over the 2300 gas limit
     * imposed by `transfer`, making them unable to receive funds via
     * `transfer`. {sendValue} removes this limitation.
     *
     * https://diligence.consensys.net/posts/2019/09/stop-using-soliditys-transfer-now/[Learn more].
     *
     * IMPORTANT: because control is transferred to `recipient`, care must be
     * taken to not create reentrancy vulnerabilities. Consider using
     * {ReentrancyGuard} or the
     * https://solidity.readthedocs.io/en/v0.5.11/security-considerations.html#use-the-checks-effects-interactions-pattern[checks-effects-interactions pattern].
     */
    function sendValue(address payable recipient, uint256 amount) internal {
        require(address(this).balance >= amount, "Address: insufficient balance");

        (bool success, ) = recipient.call{value: amount}("");
        require(success, "Address: unable to send value, recipient may have reverted");
    }

    /**
     * @dev Performs a Solidity function call using a low level `call`. A
     * plain `call` is an unsafe replacement for a function call: use this
     * function instead.
     *
     * If `target` reverts with a revert reason, it is bubbled up by this
     * function (like regular Solidity function calls).
     *
     * Returns the raw returned data. To convert to the expected return value,
     * use https://solidity.readthedocs.io/en/latest/units-and-global-variables.html?highlight=abi.decode#abi-encoding-and-decoding-functions[`abi.decode`].
     *
     * Requirements:
     *
     * - `target` must be a contract.
     * - calling `target` with `data` must not revert.
     *
     * _Available since v3.1._
     */
    function functionCall(address target, bytes memory data) internal returns (bytes memory) {
        return functionCall(target, data, "Address: low-level call failed");
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-}[`functionCall`], but with
     * `errorMessage` as a fallback revert reason when `target` reverts.
     *
     * _Available since v3.1._
     */
    function functionCall(
        address target,
        bytes memory data,
        string memory errorMessage
    ) internal returns (bytes memory) {
        return functionCallWithValue(target, data, 0, errorMessage);
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-}[`functionCall`],
     * but also transferring `value` wei to `target`.
     *
     * Requirements:
     *
     * - the calling contract must have an ETH balance of at least `value`.
     * - the called Solidity function must be `payable`.
     *
     * _Available since v3.1._
     */
    function functionCallWithValue(
        address target,
        bytes memory data,
        uint256 value
    ) internal returns (bytes memory) {
        return functionCallWithValue(target, data, value, "Address: low-level call with value failed");
    }

    /**
     * @dev Same as {xref-Address-functionCallWithValue-address-bytes-uint256-}[`functionCallWithValue`], but
     * with `errorMessage` as a fallback revert reason when `target` reverts.
     *
     * _Available since v3.1._
     */
    function functionCallWithValue(
        address target,
        bytes memory data,
        uint256 value,
        string memory errorMessage
    ) internal returns (bytes memory) {
        require(address(this).balance >= value, "Address: insufficient balance for call");
        require(isContract(target), "Address: call to non-contract");

        (bool success, bytes memory returndata) = target.call{value: value}(data);
        return verifyCallResult(success, returndata, errorMessage);
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-}[`functionCall`],
     * but performing a static call.
     *
     * _Available since v3.3._
     */
    function functionStaticCall(address target, bytes memory data) internal view returns (bytes memory) {
        return functionStaticCall(target, data, "Address: low-level static call failed");
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-string-}[`functionCall`],
     * but performing a static call.
     *
     * _Available since v3.3._
     */
    function functionStaticCall(
        address target,
        bytes memory data,
        string memory errorMessage
    ) internal view returns (bytes memory) {
        require(isContract(target), "Address: static call to non-contract");

        (bool success, bytes memory returndata) = target.staticcall(data);
        return verifyCallResult(success, returndata, errorMessage);
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-}[`functionCall`],
     * but performing a delegate call.
     *
     * _Available since v3.4._
     */
    function functionDelegateCall(address target, bytes memory data) internal returns (bytes memory) {
        return functionDelegateCall(target, data, "Address: low-level delegate call failed");
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-string-}[`functionCall`],
     * but performing a delegate call.
     *
     * _Available since v3.4._
     */
    function functionDelegateCall(
        address target,
        bytes memory data,
        string memory errorMessage
    ) internal returns (bytes memory) {
        require(isContract(target), "Address: delegate call to non-contract");

        (bool success, bytes memory returndata) = target.delegatecall(data);
        return verifyCallResult(success, returndata, errorMessage);
    }

    /**
     * @dev Tool to verifies that a low level call was successful, and revert if it wasn't, either by bubbling the
     * revert reason using the provided one.
     *
     * _Available since v4.3._
     */
    function verifyCallResult(
        bool success,
        bytes memory returndata,
        string memory errorMessage
    ) internal pure returns (bytes memory) {
        if (success) {
            return returndata;
        } else {
            // Look for revert reason and bubble it up if present
            if (returndata.length > 0) {
                // The easiest way to bubble the revert reason is using memory via assembly

                assembly {
                    let returndata_size := mload(returndata)
                    revert(add(32, returndata), returndata_size)
                }
            } else {
                revert(errorMessage);
            }
        }
    }
}

/**
 * @dev Collection of functions related to the uint type
 */
library SafeMath {
    /**
     * @dev Returns the addition of two unsigned integers, reverting on
     * overflow.
     *
     * Counterpart to Solidity's `+` operator.
     *
     * Requirements:
     *
     * - Addition cannot overflow.
     */
    function add(uint a, uint b) internal pure returns (uint) {
        uint c = a + b;
        require(c >= a, "SafeMath: addition overflow");

        return c;
    }

    /**
     * @dev Returns the subtraction of two unsigned integers, reverting on
     * overflow (when the result is negative).
     *
     * Counterpart to Solidity's `-` operator.
     *
     * Requirements:
     *
     * - Subtraction cannot overflow.
     */
    function sub(uint a, uint b) internal pure returns (uint) {
        return sub(a, b, "SafeMath: subtraction overflow");
    }

    /**
     * @dev Returns the subtraction of two unsigned integers, reverting with custom message on
     * overflow (when the result is negative).
     *
     * Counterpart to Solidity's `-` operator.
     *
     * Requirements:
     *
     * - Subtraction cannot overflow.
     */
    function sub(
        uint a,
        uint b,
        string memory errorMessage
    ) internal pure returns (uint) {
        require(b <= a, errorMessage);
        uint c = a - b;

        return c;
    }

    /**
     * @dev Returns the multiplication of two unsigned integers, reverting on
     * overflow.
     *
     * Counterpart to Solidity's `*` operator.
     *
     * Requirements:
     *
     * - Multiplication cannot overflow.
     */
    function mul(uint a, uint b) internal pure returns (uint) {
        // Gas optimization: this is cheaper than requiring 'a' not being zero, but the
        // benefit is lost if 'b' is also tested.
        // See: https://github.com/OpenZeppelin/openzeppelin-contracts/pull/522
        if (a == 0) {
            return 0;
        }

        uint c = a * b;
        require(c / a == b, "SafeMath: multiplication overflow");

        return c;
    }

    /**
     * @dev Returns the integer division of two unsigned integers. Reverts on
     * division by zero. The result is rounded towards zero.
     *
     * Counterpart to Solidity's `/` operator. Note: this function uses a
     * `revert` opcode (which leaves remaining gas untouched) while Solidity
     * uses an invalid opcode to revert (consuming all remaining gas).
     *
     * Requirements:
     *
     * - The divisor cannot be zero.
     */
    function div(uint a, uint b) internal pure returns (uint) {
        return div(a, b, "SafeMath: division by zero");
    }

    /**
     * @dev Returns the integer division of two unsigned integers. Reverts with custom message on
     * division by zero. The result is rounded towards zero.
     *
     * Counterpart to Solidity's `/` operator. Note: this function uses a
     * `revert` opcode (which leaves remaining gas untouched) while Solidity
     * uses an invalid opcode to revert (consuming all remaining gas).
     *
     * Requirements:
     *
     * - The divisor cannot be zero.
     */
    function div(
        uint a,
        uint b,
        string memory errorMessage
    ) internal pure returns (uint) {
        require(b > 0, errorMessage);
        uint c = a / b;
        // assert(a == b * c + a % b); // There is no case in which this doesn't hold

        return c;
    }

    /**
     * @dev Returns the remainder of dividing two unsigned integers. (unsigned integer modulo),
     * Reverts when dividing by zero.
     *
     * Counterpart to Solidity's `%` operator. This function uses a `revert`
     * opcode (which leaves remaining gas untouched) while Solidity uses an
     * invalid opcode to revert (consuming all remaining gas).
     *
     * Requirements:
     *
     * - The divisor cannot be zero.
     */
    function mod(uint a, uint b) internal pure returns (uint) {
        return mod(a, b, "SafeMath: modulo by zero");
    }

    /**
     * @dev Returns the remainder of dividing two unsigned integers. (unsigned integer modulo),
     * Reverts with custom message when dividing by zero.
     *
     * Counterpart to Solidity's `%` operator. This function uses a `revert`
     * opcode (which leaves remaining gas untouched) while Solidity uses an
     * invalid opcode to revert (consuming all remaining gas).
     *
     * Requirements:
     *
     * - The divisor cannot be zero.
     */
    function mod(
        uint a,
        uint b,
        string memory errorMessage
    ) internal pure returns (uint) {
        require(b != 0, errorMessage);
        return a % b;
    }
}

contract Reservoir is Ownable {
    
  using SafeMath for uint;
  using SafeERC20 for IERC20;
  
    /*
   * Distribution Logic:
   * we set only gammaDrippedPerBlock value
   *
   * 1. gammaTrollerDripRate% of 86.5% of this gammaDrippedPerBlock goes to gammatroller and
   *    farmDripRate% of 86.5% of this gammaDrippedPerBlock goes to farm
   * 2. foundationDripRate% of 86.5% of this gammaDrippedPerBlock goes to foundation
   * 3. treasuryDripRate% of 86.5% of this gammaDrippedPerBlock goes to treasury
   */

  /// @notice The block number when the Reservoir started (immutable)
  uint public dripStart;
  
  /// @notice number of GAMMA tokens that will drip per block
  uint public gammaDrippedPerBlock;


  /// @notice Reference to token to drip (immutable) i.e GAMMA
  IERC20 public token;

  /// @notice Target Addresses to drip GAMMA
  address public gammaTroller = 0xF54f9e7070A1584532572A6F640F09c606bb9A83;     
  address public foundation = 0xB47577d78c081cBb8F664ce7362034999d97e972;     
  address public treasury = 0x464f751E2a86F686201D26B189B8109e6d910948;       
  address public farmAddress = 0xB87F7016585510505478D1d160BDf76c1f41b53d; 
  
  
  /// @notice Percentage drip to targets
  uint public gammaTrollerPercentage; //changable
  uint public foundationPercentage;
  uint public treasuryPercentage; //changable 
  uint public farmPercentage; //changable
  
  uint public maxPercentage; //10000
  uint public percentageWithoutTreasuryAndFoundation;
  uint public percentageWithoutTreasuryAndFoundationMax = 9000; //at one time we will change treasury distribution to 0% foundation percentage remains same
  
  uint public constant maxGammaDrippedPerDay = 100000; // amount of gamma transferred from reservoir can never exceed 100,000 GAMMA
  
  
  /// @notice Tokens per block that to drip to targets
  uint public gammaTrollerDripRate;
  uint public foundationDripRate;
  uint public treasuryDripRate;
  uint public farmDripRate; 
   
  
  /// @notice Amount that has already been dripped
  uint public gammaTrollerDripped;
  uint public foundationDripped;
  uint public treasuryDripped;
  uint public farmDripped;
  
  
  event GammaTrollerPercentageChange(uint oldPercentage,uint newPercentage);
  event FarmPercentageChange(uint oldPercentage,uint newPercentage);
  
  event NewFoundation(address oldFoundation,address newFoundation);
  event NewTreasury(address oldTreasury,address newTreasury);
  event NewFarm(address oldFarm,address newFarm);

  event Dripped(uint totalAmount, uint timestamp);
  event FarmDripped(uint amount, uint timestamp);
  
  event GammaTrollerDripRateChange(uint oldDripRate,uint newDripRate);
  event FarmDripRateChange(uint oldDripRate,uint newDripRate);
  event FoundationDripRateChange(uint oldDripRate,uint newDripRate);
  event TreasuryDripRateChange(uint oldDripRate,uint newDripRate);

  modifier onlyFarm() {
      require(msg.sender == farmAddress, "sender is not farm");
      _;
  }
  
  constructor(IERC20 token_) {
    
    dripStart = block.number;
    token = token_;
    
    //initial number of dripped to these addresses
    gammaTrollerDripped = 0;
    foundationDripped = 0;
    treasuryDripped = 0;
    farmDripped = 0;
    
    //initial distribution percentages
    gammaTrollerPercentage = 4500;
    foundationPercentage = 1000;
    treasuryPercentage = 350;
    farmPercentage = 4150;
    maxPercentage = 10000;
    percentageWithoutTreasuryAndFoundation = 8650;
    
    gammaDrippedPerBlock = 3472222222222222000;
    
    _updateGammaDrippedPerBlockInternal();
  }

  /**
    * @notice Drips the maximum amount of tokens to match the drip rate since inception
    * @dev Note: this will only drip up to the amount of tokens available.
    * @return The amount of tokens dripped in this call
    */
  function drip() public returns (uint) {
    // First, read storage into memory
    IERC20 token_ = token;

    uint blockNumber_ = block.number;

    // drip Calculations
    uint dripFoundation   = mul(foundationDripRate, blockNumber_ - dripStart, "foundation dripTotal overflow");
    uint dripTreasury     = mul(treasuryDripRate, blockNumber_ - dripStart, "treasury dripTotal overflow");
    uint dripGammaTroller = mul(gammaTrollerDripRate, blockNumber_ - dripStart, "gammatroller dripTotal overflow");

    uint deltaDripFoundation_   = sub(dripFoundation, foundationDripped, "foundation delta drip overflow");
    uint deltaDripTreasury_     = sub(dripTreasury, treasuryDripped, "treasury delta drip overflow");
    uint deltaDripGammaTroller_ = sub(dripGammaTroller, gammaTrollerDripped, "gammaTroller delta drip overflow");


    uint totalDrip = deltaDripFoundation_+ deltaDripTreasury_ + deltaDripGammaTroller_;

    require(token_.balanceOf(address(this)) > totalDrip, "Insufficient balance");

    uint drippedNextFoundation   = add(foundationDripped, deltaDripFoundation_, "");
    uint drippedNextTreasury     = add(treasuryDripped, deltaDripTreasury_, "");
    uint drippedNextGammaTroller = add(gammaTrollerDripped, deltaDripGammaTroller_, "");

    foundationDripped   = drippedNextFoundation;
    treasuryDripped     = drippedNextTreasury;
    gammaTrollerDripped = drippedNextGammaTroller;

    token_.safeTransfer(gammaTroller, deltaDripGammaTroller_);
    token_.safeTransfer(foundation, deltaDripFoundation_);
    token_.safeTransfer(treasury, deltaDripTreasury_);

    emit Dripped(totalDrip, block.timestamp);

    return totalDrip;
  }


  function dripOnFarm(uint _amount) external onlyFarm {

    farmDripped += _amount;

    token.safeTransfer(farmAddress, _amount);

    emit FarmDripped(farmDripped, block.timestamp);

  }
  
  function changeFoundationAddress(address _newFoundation) external onlyOwner {
      
      address oldFoundation = foundation;

      foundation = _newFoundation;

      emit NewFoundation(oldFoundation,_newFoundation);

  }
  
  function changeTreasuryAddress(address _newTreasury) external onlyOwner {

      address oldTreasury = treasury;
      
      treasury = _newTreasury;
      
      emit NewTreasury(oldTreasury,_newTreasury);
  }
  
  function changeFarmAddress(address _newFarmAddress) external onlyOwner {

      address oldFarm = farmAddress;
      
      farmAddress = _newFarmAddress;
      
      emit NewFarm(oldFarm,_newFarmAddress);
  }
  
  function setPercentageWithoutTreasuryAndFoundation(uint _newPercentage,uint _newFarmPercentage) external onlyOwner {
      
      require(_newPercentage <= percentageWithoutTreasuryAndFoundationMax,"new percentage cannot exceed the max limit");
      
      percentageWithoutTreasuryAndFoundation = _newPercentage;
      
      treasuryPercentage = maxPercentage.sub(_newPercentage.add(foundationPercentage));
      
      require(_newFarmPercentage <= percentageWithoutTreasuryAndFoundation,"new percentage is above the max limit");
      
      uint oldGammaTrollerPercentage = gammaTrollerPercentage;
      uint oldFarmPercentage = farmPercentage;
      
      uint newGammaTrollerPercentage = percentageWithoutTreasuryAndFoundation.sub(_newFarmPercentage);
      uint newFarmPercentage = _newFarmPercentage;
      
      gammaTrollerPercentage = newGammaTrollerPercentage;
      farmPercentage = newFarmPercentage;
      
      emit GammaTrollerPercentageChange(oldGammaTrollerPercentage,newGammaTrollerPercentage);
      emit FarmPercentageChange(oldFarmPercentage,_newFarmPercentage);
      
      _updateGammaDrippedPerBlockInternal();
  
  }

  function setGammaDrippedPerDay(uint _tokensToDripPerDay) external onlyOwner {
      
      require(_tokensToDripPerDay <= maxGammaDrippedPerDay,"tokens to drip per day cannot exceed the max limit");
      
      uint _tokensToDripPerBlockInADay = _tokensToDripPerDay.mul(1e18).div(28800);
      
      gammaDrippedPerBlock = _tokensToDripPerBlockInADay;
      
      _updateGammaDrippedPerBlockInternal();
  
  }
  
  function _updateGammaDrippedPerBlockInternal() internal {
      
      uint oldGammaTrollerDripRate = gammaTrollerDripRate; 
      uint oldFoundationDripRate = foundationDripRate;   
      uint oldTreasuryDripRate = treasuryDripRate;     
      uint oldFarmDripRate = farmDripRate;
      
      gammaTrollerDripRate = gammaTrollerPercentage.mul(gammaDrippedPerBlock).div(maxPercentage);
      foundationDripRate   = foundationPercentage.mul(gammaDrippedPerBlock).div(maxPercentage);
      treasuryDripRate     = treasuryPercentage.mul(gammaDrippedPerBlock).div(maxPercentage);
      farmDripRate         = farmPercentage.mul(gammaDrippedPerBlock).div(maxPercentage); 
      
      emit GammaTrollerDripRateChange(oldGammaTrollerDripRate,gammaTrollerDripRate);
      emit FoundationDripRateChange(oldFoundationDripRate,foundationDripRate);
      emit TreasuryDripRateChange(oldTreasuryDripRate,treasuryDripRate);
      emit FarmDripRateChange(oldFarmDripRate,farmDripRate);
      
  }
  
  function setGammaTrollerDripPercentage(uint _newGammaTrollerPercentage) external onlyOwner {
      
      require(_newGammaTrollerPercentage <= percentageWithoutTreasuryAndFoundation,"new percentage is above the max limit");
      
      uint oldGammaTrollerPercentage = gammaTrollerPercentage;
      uint oldFarmPercentage = farmPercentage;
      
      uint newGammaTrollerPercentage = _newGammaTrollerPercentage;
      uint newFarmPercentage = percentageWithoutTreasuryAndFoundation.sub(_newGammaTrollerPercentage);
      
      gammaTrollerPercentage = newGammaTrollerPercentage;
      farmPercentage = newFarmPercentage;
      
      _updateGammaDrippedPerBlockInternal();
      
      emit GammaTrollerPercentageChange(oldGammaTrollerPercentage,_newGammaTrollerPercentage);
      emit FarmPercentageChange(oldFarmPercentage,newFarmPercentage);
  
  }
  
  function setFarmDripPercentage(uint _newFarmPercentage) external onlyOwner {
      
      require(_newFarmPercentage <= percentageWithoutTreasuryAndFoundation,"new percentage is above the max limit");
      
      uint oldGammaTrollerPercentage = gammaTrollerPercentage;
      uint oldFarmPercentage = farmPercentage;
      
      uint newGammaTrollerPercentage = percentageWithoutTreasuryAndFoundation.sub(_newFarmPercentage);
      uint newFarmPercentage = _newFarmPercentage;
      
      gammaTrollerPercentage = newGammaTrollerPercentage;
      farmPercentage = newFarmPercentage;
      
      _updateGammaDrippedPerBlockInternal();
      
      emit GammaTrollerPercentageChange(oldGammaTrollerPercentage,newGammaTrollerPercentage);
      emit FarmPercentageChange(oldFarmPercentage,_newFarmPercentage);
  
  }

  /* Internal helper functions for safe math */

  function add(uint a, uint b, string memory errorMessage) internal pure returns (uint) {
    uint c = a + b;
    require(c >= a, errorMessage);
    return c;
  }

  function sub(uint a, uint b, string memory errorMessage) internal pure returns (uint) {
    require(b <= a, errorMessage);
    uint c = a - b;
    return c;
  }

  function mul(uint a, uint b, string memory errorMessage) internal pure returns (uint) {
    if (a == 0) {
      return 0;
    }
    uint c = a * b;
    require(c / a == b, errorMessage);
    return c;
  }

  function min(uint a, uint b) internal pure returns (uint) {
    if (a <= b) {
      return a;
    } else {
      return b;
    }
  }
}
