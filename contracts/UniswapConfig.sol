// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.6.12;
pragma experimental ABIEncoderV2;
interface CErc20 {
    function underlying() external view returns (address);
}



contract UniswapConfig {
    /// @dev Describe how to interpret the fixedPrice in the TokenConfig.
    enum PriceSource {
        FIXED_ETH, /// implies the fixedPrice is a constant multiple of the ETH price (which varies)
        FIXED_USD, /// implies the fixedPrice is a constant multiple of the USD price (which is 1)
        REPORTER,  /// compare lp and chainlink price
        UNISWAP,   /// use price provide by lp pair only
        CHAINLINK  /// use price provide by chainlink only
    }

    /// @dev Describe how the USD price should be determined for an asset.
    ///  There should be 1 TokenConfig object for each supported asset, passed in the constructor.
    struct TokenConfig {
        address gToken;
        address underlying;
        bytes32 symbolHash;
        uint256 baseUnit;
        PriceSource priceSource;
        uint256 fixedPrice;
        address uniswapMarket;
        address reporter;
        uint256 reporterMultiplier;
        bool isUniswapReversed;
    }
    
    struct config_exist {
        uint index;
        bool exist;
    }

   
    TokenConfig[] public tokenConfigInfo;
    
    TokenConfig public defaultConfig = TokenConfig({
        gToken:address(0),
        underlying:address(0),
        symbolHash:bytes32(0),
        baseUnit:0,
        priceSource:PriceSource.FIXED_ETH,
        fixedPrice:0,
        uniswapMarket:address(0),
        reporter:address(0),
        reporterMultiplier:0,
        isUniswapReversed:false
    });
    
    mapping(address => config_exist) gTokenIndex;
    mapping(address => config_exist) underlyingTokenIndex;
    mapping(bytes32 => config_exist) symbolHashTokenIndex;
    mapping(address => config_exist) reporterTokenIndex;
    
    address public admin;
    
    /**
     * @notice Construct an immutable store of configs into the contract data
     * @param configs The configs for the supported assets
     */
    constructor(TokenConfig[] memory configs) public {
        
        admin = msg.sender;
        
        //require(configs.length > 0, "too less configs");
        
        for(uint i = 0 ; i < configs.length ; i++){
        
            tokenConfigInfo.push(configs[i]);
            
            config_exist memory new_config = config_exist({
                index:i,
                exist:true
            });
            
            gTokenIndex[configs[i].gToken] = new_config;
            underlyingTokenIndex[configs[i].underlying] = new_config;
            symbolHashTokenIndex[configs[i].symbolHash] = new_config;
            reporterTokenIndex[configs[i].reporter] = new_config;
        }
    }

    
    function getGTokenIndex(address gToken) internal view returns (uint) {
       if(gTokenIndex[gToken].exist)
       return gTokenIndex[gToken].index;
       
       return uint(-1);
    }

    function getUnderlyingIndex(address underlying) internal view returns (uint) {
       if(underlyingTokenIndex[underlying].exist)
       return underlyingTokenIndex[underlying].index;
       
       return uint(-1);
    }

    function getSymbolHashIndex(bytes32 symbolHash) internal view returns (uint) {
       if(symbolHashTokenIndex[symbolHash].exist)
       return symbolHashTokenIndex[symbolHash].index;
       
       return uint(-1);
    }
    
    function getReporterIndex(address reporter) internal view returns(uint) {
       if(reporterTokenIndex[reporter].exist) 
       return reporterTokenIndex[reporter].index;
        
       return uint(-1);
    }

    /**
     * @notice Get the i-th config, according to the order they were passed in originally
     * @param i The index of the config to get
     * @return The config object
     */
    function getTokenConfig(uint i) public view returns (TokenConfig memory) {
        require(i < tokenConfigInfo.length , "token config not found");

        return tokenConfigInfo[i];
    }

    function getTokenConfigInfoLength() public view returns (uint256) {
        return tokenConfigInfo.length;
    }

    /**
     * @notice Get the config for symbol
     * @param symbol The symbol of the config to get
     * @return The config object
     */
    function getTokenConfigBySymbol(string memory symbol) public view returns (TokenConfig memory) {
        return getTokenConfigBySymbolHash(keccak256(abi.encodePacked(symbol)));
    }

    /**
     * @notice Get the config for the reporter
     * @param reporter The address of the reporter of the config to get
     * @return The config object
     */
    function getTokenConfigByReporter(address reporter) public view returns (TokenConfig memory) {
        uint index = getReporterIndex(reporter);
        if (index != uint(-1)) {
            return getTokenConfig(index);
        }
        
        return defaultConfig;
    }

    /**
     * @notice Get the config for the symbolHash
     * @param symbolHash The keccack256 of the symbol of the config to get
     * @return The config object
     */
    function getTokenConfigBySymbolHash(bytes32 symbolHash) public view returns (TokenConfig memory) {
        uint index = getSymbolHashIndex(symbolHash);
        if (index != uint(-1)) {
            return getTokenConfig(index);
        }

        return defaultConfig;
    }

    /**
     * @notice Get the config for the gToken
     * @dev If a config for the gToken is not found, falls back to searching for the underlying.
     * @param gToken The address of the gToken of the config to get
     * @return The config object
     */
    function getTokenConfigByGToken(address gToken) public view returns (TokenConfig memory) {
        uint index = getGTokenIndex(gToken);
        if (index != uint(-1)) {
            return getTokenConfig(index);
        }

        return defaultConfig;
    }

    /**
     * @notice Get the config for an underlying asset
     * @param underlying The address of the underlying asset of the config to get
     * @return The config object
     */
    function getTokenConfigByUnderlying(address underlying) public view returns (TokenConfig memory) {
        uint index = getUnderlyingIndex(underlying);
        if (index != uint(-1)) {
            return getTokenConfig(index);
        }

       return defaultConfig;
    }
}