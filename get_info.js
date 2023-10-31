// 获取 liquidAccount和fromAccount 的 total_supply和total_borrow，以及账户抵押和状态信息。

// https://etherscan.io/tx/0x427009838b9e49a64743f0b65af4955ea889ceff92485fc674de6dfa3a5b603f
// https://dashboard.tenderly.co/tx/mainnet/0x427009838b9e49a64743f0b65af4955ea889ceff92485fc674de6dfa3a5b603f/debugger?trace=0.1.2.0
// https://ethtx.info/mainnet/0x427009838b9e49a64743f0b65af4955ea889ceff92485fc674de6dfa3a5b603f/


const ethers = require('ethers')
require('dotenv').config()

const provider = new ethers.providers.getDefaultProvider('http://127.0.0.1:8545/')
const SOLO_MARGIN = '0x1e0447b19bb6ecfdae1e4ae1694b0c3659614e4e'
const SOLO_MARGIN_ABI = require('./abi/solo_margin.json')
const LIQUIDA_PROXY = '0xd4b6cd147ad8a0d5376b6fdba85fe8128c6f0686'
const LIQUIDA_PROXY_ABI = require('./abi/liquidate_proxy.json')
const WEI = 1e18
const MARKETS_TOKEN = ['ETH','SAI','USDC','DAI']
const TOKEN_DECIMAL = [1e18,1e18,1e6,1e18]


// // 方向相反
// const Liquidate_Account = "0x04C6EF06074dB3bBfB77A778A327AdAb1Fe299cF"
// const Liquidate_Number = "85536892824072501323282184060106242309748294198570442988867665369893343621871"
// const From_Account = '0xBfae42A79FF045659DD0F84e65534f5c4c810023'
// const From_Number = '0'


// 方向一致
const Liquidate_Account = "0x27F2824D590d2d71ce85C2bABEFdc06b0FC81141"
const Liquidate_Number = "0"
const From_Account = '0xBfae42A79FF045659DD0F84e65534f5c4c810023'
const From_Number = '0'


function GetCurrentMarketAccountValues(par_sign, par_value, supply, borrow, price){
    if (par_value == 0){
        return 0
    }
    let user_wei = 0
    if (par_sign == true){
        user_wei = par_value * supply / 1e18
    }else{
        user_wei = (par_value * borrow - 1) / 1e18 + 1
    }
    let assetValue = user_wei * price
    return assetValue
}

function IsCollateralized(totalSupply, totalBorrow, marginRatio){
    if (totalSupply > totalBorrow * (1+marginRatio)){
        return true
    }
    return false
}

async function GetCurrentAccountValues(){
    const SoloMarginContract = new ethers.Contract(SOLO_MARGIN, SOLO_MARGIN_ABI, provider)
    const MarketNumber = await SoloMarginContract.getNumMarkets()
    let MarginRatio = await SoloMarginContract.getMarginRatio()
    console.log("MarginRatio",Number(MarginRatio.value._hex),Number(MarginRatio.value._hex)/WEI)
 

    // console.log("MarKetNumber",Number(MarketNumber._hex), "\n")

    // for(let i=0;i<Number(MarketNumber._hex);i++){
    //     let MarketPrice = await SoloMarginContract.getMarketPrice(i)
    //     let MarketIndex = await SoloMarginContract.getMarketCurrentIndex(i)
    //     // GetAccountPar
    //     let par = await SoloMarginContract.getAccountPar([Liquidate_Account,Liquidate_Number],i)
    //     let assetValue = GetCurrentMarketAccountValues(par.sign, Number(par.value._hex), Number(MarketIndex.supply._hex), Number(MarketIndex.borrow._hex), Number(MarketPrice.value._hex))
    //     if (assetValue > 0){
    //         if (par.sign == true){
    //             totalSupply_liquidaAccount += assetValue
    //         }else{
    //             totalBorrow_liquidaAccount += assetValue
    //         }
    //     }

    //     par = await SoloMarginContract.getAccountPar([From_Account,From_Number],i)
    //     assetValue = GetCurrentMarketAccountValues(par.sign, Number(par.value._hex), Number(MarketIndex.supply._hex), Number(MarketIndex.borrow._hex), Number(MarketPrice.value._hex))
    //     if (assetValue > 0){
    //         if (par.sign == true){
    //             totalSupply_fromAccount += assetValue
    //         }else{
    //             totalBorrow_fromAccount += assetValue
    //         }
    //     }
    // }
    let Values = (await SoloMarginContract.getAccountValues([Liquidate_Account,Liquidate_Number]))
    let totalSupply_liquidaAccount = Number(Values[0].value._hex)
    let totalBorrow_liquidaAccount = Number(Values[1].value._hex)

    Values = (await SoloMarginContract.getAccountValues([From_Account,From_Number]))
    let totalSupply_fromAccount = Number(Values[0].value._hex)
    let totalBorrow_fromAccount = Number(Values[1].value._hex)


    console.log("totalSupply_liquidaAccount",totalSupply_liquidaAccount/1e36)
    console.log("totalBorrow_liquidaAccount",totalBorrow_liquidaAccount/1e36)
    console.log("LiquidAccount: The Supply is enough.",IsCollateralized(totalSupply_liquidaAccount, totalBorrow_liquidaAccount, Number(MarginRatio.value._hex)/WEI))
    console.log("")
    console.log("totalSupply_fromAccount",totalSupply_fromAccount/1e36)
    console.log("totalBorrow_fromAccount",totalBorrow_fromAccount/1e36)
    console.log("fromAccount: The Supply is enough.",IsCollateralized(totalSupply_fromAccount, totalBorrow_fromAccount, Number(MarginRatio.value._hex)/WEI))

}

async function SoloMariginGetMarketInfo(){
    const SoloMarginContract = new ethers.Contract(SOLO_MARGIN, SOLO_MARGIN_ABI, provider)
    const MarketNumber = await SoloMarginContract.getNumMarkets()
    let MarginRatio = await SoloMarginContract.getMarginRatio()    
    console.log("MarginRatio",Number(MarginRatio.value._hex)/WEI)
    console.log("MarKetNumber",Number(MarketNumber._hex), "\n")

    for(let i=0;i<Number(MarketNumber._hex);i++){
        let MarketPrice = await SoloMarginContract.getMarketPrice(i)
        let MarketIndex = await SoloMarginContract.getMarketCurrentIndex(i)
        let MarketTokenAddress = await SoloMarginContract.getMarketTokenAddress(i)
        // console.log("MarketTokenAddress",MarketTokenAddress,MARKETS_TOKEN[i])
        // console.log("MarketTokenPrice",Number(MarketPrice.value._hex))
        // console.log("MarKetIndex","Borrow",Number(MarketIndex.borrow._hex),"Supply",Number(MarketIndex.supply._hex),"LastUpdate",(MarketIndex.lastUpdate))

        // GetAccountPar
        let par = await SoloMarginContract.getAccountPar([Liquidate_Account,Liquidate_Number],i)
        console.log("LiquidaAccount GetAccountPar",par.sign, Number(par.value._hex)/TOKEN_DECIMAL[i])
        let assetValue = GetCurrentMarketAccountValues(par.sign, Number(par.value._hex), Number(MarketIndex.supply._hex), Number(MarketIndex.borrow._hex), Number(MarketPrice.value._hex))
        console.log("LiquidaAccount AssetValue",assetValue/1e36)
        //FromAccount
        par = await SoloMarginContract.getAccountPar([From_Account,From_Number],i)
        console.log("FromAccount GetAccountPar",par.sign, Number(par.value._hex)/TOKEN_DECIMAL[i])
        assetValue = GetCurrentMarketAccountValues(par.sign, Number(par.value._hex), Number(MarketIndex.supply._hex), Number(MarketIndex.borrow._hex), Number(MarketPrice.value._hex))
        console.log("FromAccount AssetValue",assetValue/1e36)
        console.log("")
    }

    // GetAccountStatus
    let status = await SoloMarginContract.getAccountStatus([Liquidate_Account,Liquidate_Number])
    console.log("Status",status)

    // GetLiquidationSpreadForPair
    let spread = await SoloMarginContract.getLiquidationSpreadForPair(0,2)

    //console.log("Spread",Number(spread.value._hex)/WEI)   
}


async function main(){
    await SoloMariginGetMarketInfo()


    console.log('\n' + '++++++++++++++++++++++++' + '\n')

    await GetCurrentAccountValues()

    

}


main()
// GetCurrentAccountValues()

// SoloMariginGetMarketInfo()

// GetCurrentAccountValues()



// 不同类型
// https://etherscan.io/tx/0xb5c342c9e610dd77c9ebdd69ebaa95dd1e6e1eb80147ef89e89ee94211a502f1
// https://ethtx.info/mainnet/0xb5c342c9e610dd77c9ebdd69ebaa95dd1e6e1eb80147ef89e89ee94211a502f1/aa
// https://dashboard.tenderly.co/tx/mainnet/0xb5c342c9e610dd77c9ebdd69ebaa95dd1e6e1eb80147ef89e89ee94211a502f1/debugger?trace=0.1.6