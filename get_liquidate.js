// 检查有没有人不通过代理合约而是直接调用第七个Action：liquidate做过清算
// 没有人直接做liquidate， 都是通过proxy contract

const axios = require('axios')
const ethers = require('ethers')
const fs = require('fs')
const WRITE_SEP = ','
const CONTRACT_ADDRESS = "0x1e0447b19bb6ecfdae1e4ae1694b0c3659614e4e"
const START_BLOCK = 0
const END_BLOCK = 15268359
const ABI = require('./abi/solo_margin.json')
const ACTION_TYPE = ['Deposit','Withdraw','Transfer','Buy','Sell',"Trade",'Liquidate','Vaporize','Call']

async function GetLiquidateDataFromEtherscan(){
    let data = await axios.get(`http://api.etherscan.io/api?module=account&action=txlist&address=${CONTRACT_ADDRESS}&startblock=${START_BLOCK}&endblock=${END_BLOCK}&sort=desc&apikey=3H4MQK4MBZAEXWHT1EE3I56XYSVSRI4MV9`)
    data = data.data
    if (data.status != "1") {
        console.log("Error: " + data.message)
        return 
    }

    const file = fs.createWriteStream('liquidate_info.txt');
    const iface = new ethers.utils.Interface(ABI);
    data.result.forEach(element => {
        if (element.to == CONTRACT_ADDRESS && element.isError == "0") {
            let decodedData = iface.parseTransaction({ data: element.input });
            // console.log("Hash",element.hash)
            if (decodedData.args.actions != undefined){
                decodedData.args.actions.forEach(action => {
                    if (action[0] == 6){
                        console.log("Hash",element.hash)
                        // console.log("Account:",decodedData.args.accounts[0].owner,"Number:",decodedData.args.accounts[0].number.toString(),"ActionType:",ACTION_TYPE[action[0]])
                    }
                })
            }

        }
    })
    file.end()
}

GetLiquidateDataFromEtherscan()


