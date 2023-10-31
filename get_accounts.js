// GetBorrowAccountData() 站在区块高度下， 去遍历存在BorrowAction的Accounts

// CheckAccountInfo() 是在拿到上面的account之后， 再拿dydx借贷市场信息

// GetContractInteract() 拿Account和Contract的交互记录，去检查该账户的transaction记录

const axios = require('axios')

const ethers = require('ethers')
const fs = require('fs')
const WRITE_SEP = ','
const CONTRACT_ADDRESS = "0x1e0447b19bb6ecfdae1e4ae1694b0c3659614e4e"
const START_BLOCK = 0
const END_BLOCK = 15272487
const ABI = require('./abi/solo_margin.json')
const ACTION_TYPE = ['Deposit','Withdraw','Transfer','Buy','Sell',"Trade",'Liquidate','Vaporize','Call']

//    
const provider = new ethers.providers.getDefaultProvider('http://127.0.0.1:8545/')
// const provider = new ethers.providers.JsonRpcBatchProvider("https://eth-mainnet.g.alchemy.com/v2/-tqWgpPT2ejfyf7gwKBUejZBajzxL_eu")
const SOLO_MARGIN = '0x1e0447b19bb6ecfdae1e4ae1694b0c3659614e4e'
const SOLO_MARGIN_ABI = require('./abi/solo_margin.json')
const WEI  = 1e18
const MARKETS_TOKEN = ['ETH','SAI','USDC','DAI']

function IsCollateralized(totalSupply, totalBorrow, marginRatio){
    if (totalSupply > totalBorrow * (1+marginRatio)){
        return true
    }
    return false
}

function GetCurrentMarketAccountValues(par_sign, par_value, supply, borrow, price){
    if (par_value == 0){
        return 0
    }
    let user_wei = 0
    if (par_sign == true){
        user_wei = par_value * supply / 1e18
    }else{
        user_wei = (par_value * borrow ) / 1e18
    }
    let assetValue = user_wei * price
    return assetValue
}



async function GetBorrowDataFromEtherscan(){
    let data = await axios.get(`http://api.etherscan.io/api?module=account&action=txlist&address=${CONTRACT_ADDRESS}&startblock=${START_BLOCK}&endblock=${END_BLOCK}&sort=desc&apikey=3H4MQK4MBZAEXWHT1EE3I56XYSVSRI4MV9`)
    data = data.data
    if (data.status != "1") {
        console.log("Error: " + data.message)
        return 
    }

    const file = fs.createWriteStream('need_info.txt');
    const iface = new ethers.utils.Interface(ABI);
    // 找到有borrow的那些account的address和number
    data.result.forEach(element => {
        if (element.to == CONTRACT_ADDRESS && element.isError == "0") {
            let decodedData = iface.parseTransaction({ data: element.input });
            if (decodedData.args.actions != undefined){
                if (decodedData.args.actions.length == 1 && decodedData.args.actions[0][0]== 1){
                    // console.log("Action Length",decodedData.args.actions.length)
                    // console.log("Hash",element.hash)
                    // console.log("Account:",decodedData.args.accounts[0].owner,"Number:",decodedData.args.accounts[0].number.toString(),"ActionType:",ACTION_TYPE[decodedData.args.actions[0][0]])
                    file.write(element.hash + WRITE_SEP + decodedData.args.accounts[0].owner + WRITE_SEP + decodedData.args.accounts[0].number.toString() + '\n');
                }
            }

        }
    })
    file.end()
}


async function CheckAccountInfo(account,number,file){
    const SoloMarginContract = new ethers.Contract(SOLO_MARGIN, SOLO_MARGIN_ABI, provider)
    const MarketNumber = await SoloMarginContract.getNumMarkets()
    let MarginRatio = await SoloMarginContract.getMarginRatio()
    // console.log("MarginRatio",Number(MarginRatio.value._hex),Number(MarginRatio.value._hex)/WEI)
    let total_supply = 0
    let total_borrow = 0

    let Values = (await SoloMarginContract.getAccountValues([account,number]))
    total_borrow = Number(Values[1].value._hex)
    total_supply = Number(Values[0].value._hex)

    let status = await SoloMarginContract.getAccountStatus([account,number])
    // 如果只找supply !=0 的account
    // 找supply !=0 并且 抵押率为false/标记状态为1， 我们会发现 有一些accounts是被标记的
    // 发现这些accounts的total_borrow全为0
    if (total_supply != 0) {
        if ( IsCollateralized(total_supply, total_borrow, Number(MarginRatio.value._hex)/WEI) == false || status == 1){
            console.log(account,number)
            console.log("total_supply",total_supply)
            console.log("total_borrow",total_borrow)
            console.log("LiquidAccount: The supply is enough.",IsCollateralized(total_supply, total_borrow, Number(MarginRatio.value._hex)/WEI))
            console.log("LiquidAccount: The status is",status,"\n")
            file.write(account + WRITE_SEP + number + WRITE_SEP + status + WRITE_SEP + Number(IsCollateralized(total_supply, total_borrow, Number(MarginRatio.value._hex)/WEI) == false)  +  '\n');
        }
    }
    // console.log(account,number)
    // console.log("total_supply",total_supply)
    // console.log("total_borrow",total_borrow)
    // console.log("LiquidAccount: The Supply is enough. Collaterallized:",IsCollateralized(total_supply, total_borrow, Number(MarginRatio.value._hex)/WEI))
    // console.log("LiquidAccount: The status is",status,"\n")
}

async function GetAccountInteractionContract(account,contract){
    const his_provider = new ethers.providers.EtherscanProvider('homestead', "3H4MQK4MBZAEXWHT1EE3I56XYSVSRI4MV9")
    let history = await his_provider.getHistory(account)
    // console.log("history",history)
    history.forEach(element => {
        if (element.to.toLocaleLowerCase() == contract){
            console.log(`https://etherscan.io/tx/${element.hash}`)
            // console.log(element.hash)
            console.log('')
        }
    })
}

async function main(){
    GetBorrowDataFromEtherscan()

    let data = fs.readFileSync('need_info.txt').toString().split('\n')
    const file = fs.createWriteStream('tem_need_account_info.txt');
    for(let i=0;i<data.length-1;i++){
    // for(let i=0;i<5;i++){
        let line = data[i].split(WRITE_SEP)
        if (line.length == 3){
            await CheckAccountInfo(line[1],line[2],file)
        }
    }
    file.end()

    // GetAccountInteractionContract("0x04C6EF06074dB3bBfB77A778A327AdAb1Fe299cF",SOLO_MARGIN.toLocaleLowerCase())
    // GetAccountInteractionContract("0x27F2824D590d2d71ce85C2bABEFdc06b0FC81141",SOLO_MARGIN.toLocaleLowerCase())


}



main()
// provider.getBlockNumber().then(console.log)






