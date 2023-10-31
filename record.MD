npx hardhat node --fork https://eth-mainnet.g.alchemy.com/v2/-tqWgpPT2ejfyf7gwKBUejZBajzxL_eu --fork-block-number 13327220 --verbose
13327520

npx hardhat node --fork https://eth-mainnet.g.alchemy.com/v2/-tqWgpPT2ejfyf7gwKBUejZBajzxL_eu --fork-block-number 13509210 --verbose

npx hardhat node --fork https://eth-mainnet.g.alchemy.com/v2/-tqWgpPT2ejfyf7gwKBUejZBajzxL_eu --fork-block-number 13133123 --verbose



## 方向一致

如何拿到 liquidaAccount， skip  

LiquidateAccount 一些信息， 比如 借了多少钱， 比如 抵押了多少钱

totalSupply_liquidaAccount 1.7730004023752488e+38
v                          1.7928102056351186e+38

totalBorrow_liquidaAccount 1.5589653962044512e+38  --> 0



被清算了， Borrow 1.5589653962044512e+38 --> 0  
          supply 1.7730004023752488e+38 --> 1.3608892223863986e+37 
          
原来情况， supply 1.7 borrow 1.5  --> 0.2 
现在的情况 



totalSupply_fromAccount 1.977443826934235e+41
totalSupply_fromAccount 1.979082960111039e+41
变多了

totalBorrow_fromAccount 8.787554595703679e+40
totalBorrow_fromAccount 8.803144302215422e+40
变多了

问题一， 为什么对于Fromaccount来说， 两者都变多




LiquidateAccount false --> borrow 34789714733210612 ETH  borrowValue 1.5589653962044512e+38


LiquidateAccount true --> supply 157635837  supplyValue 1.7730004023752488e+38


LiquidateAccount 借出来的ETH， 抵押的USDC

------------------------

FromAccount 正常来说 抵押ETH， 借出来的USDC

------------------------

FromAccount false --> borrow 19610218310897750000 ETH BorrowValue 8.787554595703679e+40

FromAccount true --> Supply 112023387589  USDC SupplyValue 1.2599768875572083e+41

FromAccount true --> Supply 6.364652829211835e+22 DAI  SupplyValue 7.1746693937702675e+40

From  借出来的ETH， 存的USDC+DAI

FromAccount和liquidateAccount的方向是一样的， 所以就导致了 我最后Fromaccount的supply和borrow都增加了









------------------

From account的borrow number增加，是不是因为帮liquidate account还钱的原因

方向有关， 并不绝对

方向一致 supply和borrow 都会增加， fromAccount赚钱了， 所以

supply和borrow 








# 判断账户是否可以被清算

1. 抵押不足

2. 对于SoLO——Margin合约来说， liquidaaccount所处状态被标记是“可以被清算的”，这种情况下也是可以被清算的









## 方向不一致
LiquidateAccount -- true -- supply ETH number 170761685116411500 value 5.073300037949984e+38
LiquidateAccount -- false -- borrow USDC number 620826 value 7.468638448547432e+35

FromAccount -- true -- supply USDC number 110861101848 value 1.2407939996640751e+41
FromAccount -- true -- supply DAI number 6.726278798117709e+22 value 7.552744240734533e+40
FromAccount -- false -- borrow ETH number 19612683954673970000 value 5.92900600924169e+40

totalSupply_fromAccount 1.9960684237375284e+41
totalSupply_fromAccount 1.9960620510822087e+41\

totalBorrow_fromAccount 5.92900600924169e+40
totalBorrow_fromAccount 5.928927727542652e+40 
因此，方向一致，B S都减少了，但是抵押率肯定是升高了





# 在这个方向不一致的transaction下对调用合约函数的一个内部运行过程的详细分析（完整走一遍）
owedPreference = 0,1,3,2
heldPreference = 2,0,3,1

1. owedMarket = 0 ETH  heldMarket =2 USDC  break
                                            break
                                            break
                                            break

2. owdMarket = SAI heldMarket = USDC break
                                        break
                                        break
                                        break

3. owdMarket = USDC heldMarket = USDC continue
                USDC             ETH  Run 


方向不一致

SAFE 

LiquidateAccount  抵押ETh， 借USDC  清算掉USDC
heldMarket ETH
owdMarket USDC，  liquidateAccount的owdMarket 从 false --> 0  AMOUNT


FromAccount       借的ETH   抵押USDC
heldMarket ETH   【OwedETH】  false
owdMarket USDC   【held USDC】  true --> 0   ==>false 
SUPPLY 


MAX
一定要把 liquidateAccount的 owedMarket 给你清完

AMOUNT




Q：
LiquiAccount Supply 100USDC Borrow 0.1ETH


FromAccount Borrow 1000USDC Supply 2ETH

FromAccunt Borrow 800USDC Supply 1.9ETH
？？？











# Day2

1. 