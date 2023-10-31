// 清算的主函数

const ethers = require('ethers')
const hre = require("hardhat");
require('dotenv').config()

const provider = new ethers.providers.getDefaultProvider('http://127.0.0.1:8545/')
const LIQUIDA_PROXY = '0xd4b6cd147ad8a0d5376b6fdba85fe8128c6f0686'
const LIQUIDA_PROXY_ABI = require('./abi/liquidate_proxy.json')
const UNLOCK_ADDRESS = "0x75ef8432566a79c86bbf207a47df3963b8cf0753"

async function sendETH(){
    const wallet = new ethers.Wallet("ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",provider)
    const tx = {
        to: "0x869D7e8506D5ABB5e516970dd4FA14AB66a603Fe",
        value: ethers.utils.parseEther("0.1")
    }
    const txHash = await wallet.sendTransaction(tx)
    console.log(txHash)
}

async function getBalance(address){
    let balance = await provider.getBalance(address)
    balance = ethers.utils.formatEther(balance)
    console.log("Wallet Address",address,balance)
}

async function unlock(address){
    getBalance(address)
    getBalance("0x869D7e8506D5ABB5e516970dd4FA14AB66a603Fe")
    await hre.network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [address],
      });
    const impersonatedSigner = await provider.getSigner(address)
    const tx = {
        to: "0x869D7e8506D5ABB5e516970dd4FA14AB66a603Fe",
        value: ethers.utils.parseEther("1")
    }
    await impersonatedSigner.sendTransaction(tx);
    getBalance(address)
    getBalance("0x869D7e8506D5ABB5e516970dd4FA14AB66a603Fe")
}

async function liquidateDemo(address,data){
    // getBalance(address)
    await hre.network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [address],
      });
    const impersonatedSigner = await provider.getSigner(address)
    const tx = {
        to: "0xd4b6cd147ad8a0d5376b6fdba85fe8128c6f0686",
        data: data
    }
    let hash = await impersonatedSigner.sendTransaction(tx);
    console.log(hash)
}

async function liquidate(address,from_account,liquidate_account,minLiquidatorRatio,minValueLiquidated,owedPreferences,heldPreferences){
    //Fork Account tx
    // Unlock
    await hre.network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [address],
      });
    const wallet = await provider.getSigner(address)


    const abiCoder = new ethers.utils.AbiCoder();
    let data = abiCoder.encode(["tuple(address,uint256)","tuple(address,uint256)","tuple(uint256)","uint256","uint256[]","uint256[]"],[from_account, liquidate_account,minLiquidatorRatio,minValueLiquidated,owedPreferences,heldPreferences])
    console.log("Send Data","0xc29a4b71" + data.slice(2))


    const LiquidateContract = new ethers.Contract(LIQUIDA_PROXY, LIQUIDA_PROXY_ABI, provider)
    const signer = LiquidateContract.connect(wallet)
    let tx = await signer.liquidate(from_account, liquidate_account,minLiquidatorRatio,minValueLiquidated,owedPreferences,heldPreferences)
    
    console.log(tx)
}







// 方向不同的, 即较好情况的tx
// https://etherscan.io/tx/0x427009838b9e49a64743f0b65af4955ea889ceff92485fc674de6dfa3a5b603f

// let from_account = ["0xBfae42A79FF045659DD0F84e65534f5c4c810023","0"]
// let liquidate_account = ["0x04C6EF06074dB3bBfB77A778A327AdAb1Fe299cF","85536892824072501323282184060106242309748294198570442988867665369893343621871"]
// let minLiquidatorRatio = ["500000000000000000"]
// let minValueLiquidated = "100000000000000000000000000000000000000"
// let owedPreferences = [0,1,3,2]
// let heldPreferences = [2,0,3,1]
// liquidate(UNLOCK_ADDRESS,from_account,liquidate_account,minLiquidatorRatio,minValueLiquidated,owedPreferences,heldPreferences)



// 只需要 回到合适的区块 ， 然后 遍历10000条， 就能拿到 liquidate_ACCOUNT 参数 就能liquidate


// liquidateDemo("0x75ef8432566a79c86bbf207a47df3963b8cf0753","0xc29a4b71000000000000000000000000bfae42a79ff045659dd0f84e65534f5c4c810023000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004c6ef06074db3bbfb77a778a327adab1fe299cfbd1c2a69bcc68f8004a478443ad0616e6e99bb1ac7695a9a067d2649ac2872ef00000000000000000000000000000000000000000000000006f05b59d3b20000000000000000000000000000000000004b3b4ca85a86c47a098a224000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001a00000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000003000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000030000000000000000000000000000000000000000000000000000000000000001")


// 方向相同的tx
// https://etherscan.io/tx/0xb5c342c9e610dd77c9ebdd69ebaa95dd1e6e1eb80147ef89e89ee94211a502f1

let from_account = ["0xBfae42A79FF045659DD0F84e65534f5c4c810023","0"]
let liquidate_account = ["0x27F2824D590d2d71ce85C2bABEFdc06b0FC81141","0"]
let minLiquidatorRatio = ["500000000000000000"]
let minValueLiquidated = "100000000000000000000000000000000000000"
let owedPreferences = [0,1,3,2]
let heldPreferences = [2,0,3,1]
liquidate(UNLOCK_ADDRESS,from_account,liquidate_account,minLiquidatorRatio,minValueLiquidated,owedPreferences,heldPreferences)

// liquidateDemo("0x75ef8432566a79c86bbf207a47df3963b8cf0753","0xc29a4b71000000000000000000000000bfae42a79ff045659dd0f84e65534f5c4c810023000000000000000000000000000000000000000000000000000000000000000000000000000000000000000027f2824d590d2d71ce85c2babefdc06b0fc81141000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006f05b59d3b20000000000000000000000000000000000004b3b4ca85a86c47a098a224000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001a00000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000003000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000030000000000000000000000000000000000000000000000000000000000000001")