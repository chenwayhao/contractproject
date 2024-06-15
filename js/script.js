$(async function () {
    console.log("ethereum", window.ethereum);
    if (typeof window.ethereum !== "undefined") {
        //檢查瀏覽器是否已安裝MetaMask
        try {
            //var accounts = await ethereum.enable(); //MetaMask請求用戶授權, 舊版的用法未來會停用
            var accounts = await ethereum.request({ method: "eth_requestAccounts" }); //MetaMask請求用戶授權, 連結會登入到MetaMask
            console.log("accounts", accounts);

            updateWeb3Account(accounts[0]);
        } catch (error) {
            alert(error.message);
        }
    } else {
        alert("未安裝 MetaMask!");
    }
});

//MetaMask連結區塊鏈
ethereum.on("connect", function (connectInfo) {
    console.log("connect", connectInfo);
    let chain = "(" + connectInfo.chainId + ")" + getChainNameByID(connectInfo.chainId);
    $("#chain").val(chain);
});

//MetaMask切換網路
ethereum.on("chainChanged", function (chainId) {
    console.log("chainChanged", chainId);
    window.location.reload();
});

//MetaMask切換帳戶
ethereum.on("accountsChanged", function (accounts) {
    console.log("accountsChanged", accounts);
    updateWeb3Account(accounts[0]);
    location.reload();
});

//根據Chain ID取得網路名稱
function getChainNameByID(chainid) {
    switch (chainid) {
        case "0x1":
            return "Ethereum Main Network";
        case "0x3":
            return "Ropsten Test Network";
        case "0x4":
            return "Rinkeby Test Network";
        case "0x5":
            return "Goerli Test Network";
        case "0x2a":
            return "Kovan Test Network";
        case "0x539":
            return "Ganache Test Network";
        case "0xaa36a7":
            return "Sepolia Test Network";
        default:
            return "Unknown Network";
    }
}

//更新帳戶資料
function updateWeb3Account(accounts) {
    $("#account").val(accounts);
}




async function updateWeb3Information() {
    $("#web3_version").html(web3.version);
    console.log("providers", web3.providers);
    console.log("given provider", web3.givenProvider);

    var block_number = await web3.eth.getBlockNumber(); //查詢目前的區塊編號
    console.log("Block Number", block_number);
    $("#block_number").val(block_number);
}

async function createContract(){
    const contract_address = '0x889cC55e6DFe511148377B132234C22590ad66e5';
    APS_contract = new web3.eth.Contract(APS_ABI, contract_address);
    console.log("contract: ", APS_contract);
    return APS_contract;
}

//找 interest rate 
async function contract_InterestRate(contract){
    try{
        var data = contract.methods.interestRate().call();
        return data
    }catch(e){
        console.log(e);
        alert("抓取 interestRate 失敗");
    }
}

//找 deposit 資料
async function contract_deposit(contract, account, num){
    try{
        const numBN = Web3.utils.toBN(num);
        const data = await contract.methods.deposits(account, numBN).call();
        return data
    }catch(e){
        console.log(e);
        Swal.fire({
            title: "合約編號錯誤！",
            text: "提款失敗",
            icon: "warning"
          })
    }
}

// blocktimeStamp 轉成 日期
function timestampToDate(timestamp) {
  const date = new Date(timestamp * 1000); // 將時間戳記從秒轉換為毫秒
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份從 0 開始
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

async function getbalanceOf(contract){
    var accounts = await ethereum.request({ method: "eth_requestAccounts" }); //MetaMask請求用戶授權, 連結會登入到MetaMask
    console.log("accounts", accounts[0]);
    try{
        const APS_balance = await contract.methods.balanceOf(accounts[0]).call();
        console.log(APS_balance);
        $("#balance").val(APS_balance);
    }catch(e){
        console.log(e);
    }
}

async function earlyWithdraw_Deposit(contract ,num){
    const numBN = Web3.utils.toBN(num);
    console.log(numBN);
    var accounts = await ethereum.request({ method: "eth_requestAccounts" });
    try{
        await contract.methods.earlyWithdraw(numBN).send({from: accounts[0]});
        Swal.fire({
          title: "Withdraw Success!",
          text: "提款成功！",
          icon: "success"
        }).then((result) => {
            if (result.isConfirmed || result.isDismissed) {
                location.reload(); // Reload the entire page
            }
        });
    }catch(e){
        console.log(e);
        Swal.fire({
            title: "Withdraw Error!",
            text: "提款失敗！",
            icon: "Error"
          })
    } 
}


async function withdraw_Deposit(contract , num){
    const numBN = Web3.utils.toBN(num);
    console.log(numBN);
    var accounts = await ethereum.request({ method: "eth_requestAccounts" });
    try{
        await contract.methods.withdrawDeposit(numBN).send({from: accounts[0]});
        Swal.fire({
          title: "Withdraw Success!",
          text: "提款成功！",
          icon: "success"
        }).then((result) => {
            if (result.isConfirmed || result.isDismissed) {
                location.reload(); // Reload the entire page
            }
        });
    }catch(e){
        console.log(e);
        Swal.fire({
            title: "Withdraw Error!",
            text: "提款失敗！",
            icon: "Error"
          })
    } 
}


async function contract_depositTokens(contract){
    var deposit_amount = $("#deposit_amount").val();
    var deposit_duration = $("#deposit_duration").val();
    console.log("amount", deposit_amount);
    console.log("duration", deposit_duration);

    var accounts = await ethereum.request({ method: "eth_requestAccounts" });

    try{
        await contract.methods.DepositTokens(deposit_amount, deposit_duration).send({from: accounts[0]})
        .on('transactionHash', function(hash){
            console.log("Transaction Hash:", hash);
        });
        Swal.fire({
          title: "Deposit Made!",
          text: "存款成功！",
          icon: "success"
        }).then((result) => {
            if (result.isConfirmed || result.isDismissed) {
                location.reload(); // Reload the entire page
            }
        });
    } catch (e){
        console.log(e);
        alert("執行deposit失敗");
    }
}


async function contract_earlyWithdrawalFeeRate(contract){
    try{
        var data = contract.methods.earlyWithdrawalFeeRate().call();
        return data
    }catch(e){
        console.log(e);
        alert("抓取提前解約費用率失敗")
    }
}

async function contract_Owner(contract){
    try{
        var data = contract.methods.owner().call();
        return data
    }catch(e){
        console.log(e);
        alert("抓取合約擁有者地址失敗")
    }
}

async function setInterestRate(contract, newRate) {
    var accounts = await ethereum.request({ method: "eth_requestAccounts" });
    try {
        await contract.methods.setInterestRate(newRate).send({ from: accounts[0] });
        alert("利率更改成功");
        location.reload(); 
    } catch (e) {
        console.log(e);
        alert("利率更改失敗");
    }
}

async function setEarlyWithdrawalFeeRate(contract, newRate) {
    var accounts = await ethereum.request({ method: "eth_requestAccounts" });
    try {
        await contract.methods.setEarlyWithdrawalFeeRate(newRate).send({ from: accounts[0] });
        alert("提前解約費用率更改成功");
        location.reload(); 
    } catch (e) {
        console.log(e);
        alert("提前解約費用率更改失敗");
    }
}
