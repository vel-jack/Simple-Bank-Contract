import { useState, useEffect } from "react";
import { ethers, utils } from "ethers";
import { contractAddress, contractABI } from "./utils/contract";
const App = () => {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [customerAddress, setCustomerAddress] = useState(null);
  const [bankName, setBankName] = useState("");
  const [inputValue, setInputValue] = useState({
    deposit: "",
    withdraw: "",
    bankName: "",
  });
  const [isBankOwner, setIsBankOwner] = useState(false);
  const [bankOwner, setBankOwner] = useState("");
  const [customerBalance, setCustomerBalance] = useState(null);
  const getContract = () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const bankContract = new ethers.Contract(
      contractAddress,
      contractABI,
      signer
    );
    return bankContract;
  };

  const checkIsWalletConnected = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        const account = accounts[0];
        setIsWalletConnected(true);
        setCustomerAddress(account);
      } else {
        window.alert("Please install Metamask");
        console.log("No ethereum providers available");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getBankName = async () => {
    try {
      if (window.ethereum) {
        const bankContract = getContract();
        let bankName = await bankContract.bankName();
        if (bankName.length > 0) {
          bankName = utils.parseBytes32String(bankName);
          setBankName(bankName.toString());
        }
      } else {
        window.alert("Please install Metamask");
        console.log("No ethereum providers available");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const setBankHandler = async () => {
    if (inputValue.bankName.length < 2)
      return window.alert("Please Provide more than 1 character");
    try {
      if (window.ethereum) {
        const bankContract = getContract();
        const txn = await bankContract.setBankName(
          utils.formatBytes32String(inputValue.bankName)
        );
        console.log("Trying to change...");
        txn.wait();
        console.log("Changed.. ", txn.checkIsWalletConnected);
        await getBankName();
      } else {
        window.alert("Please install Metamask");
        console.log("No ethereum providers available");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const bankOwnerHadler = async () => {
    try {
      if (window.ethereum) {
        const bankContract = getContract();
        let owner = await bankContract.bankOwner();
        setBankOwner(owner);
        const [account] = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        if (owner.toLowerCase() === account.toLowerCase()) {
          setIsBankOwner(true);
        }
      } else {
        window.alert("Please install Metamask");
        console.log("No ethereum providers available");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const balanceHandler = async () => {
    try {
      if (window.ethereum) {
        const bankContract = getContract();
        let balance = await bankContract.getCustomerBalance();
        setCustomerBalance(utils.formatEther(balance));
        console.log("Customer balance is ", utils.formatEther(balance));
      } else {
        window.alert("Please install Metamask");
        console.log("No ethereum providers available");
      }
    } catch (error) {
      console.log(error);
    }
  };
  const depositHandler = async () => {
    if (inputValue.deposit <= 0) {
      return window.alert("Please provide more than 0");
    }

    try {
      if (window.ethereum) {
        const bankContract = getContract();
        const txn = await bankContract.depositMoney({
          value: ethers.utils.parseEther(inputValue.deposit),
        });
        console.log("Trying to deposit..");
        txn.wait();
        console.log("Deposited.. ", txn.hash);
        await balanceHandler();
      } else {
        window.alert("Please install Metamask");
        console.log("No ethereum providers available");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const withdrawHandler = async () => {
    if (inputValue.withdraw <= 0) {
      return window.alert("Please provide more than 0");
    }
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const bankContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        const account = await signer.getAddress();
        console.log("Provider signer.. ", account);
        const txn = await bankContract.withDrawMoney(
          account,
          utils.parseEther(inputValue.withdraw)
        );
        console.log("Trying to withdraw..");
        txn.wait();
        console.log("Withdraw.. ", txn.hash);
        await balanceHandler();
      } else {
        window.alert("Please install Metamask");
        console.log("No ethereum providers available");
      }
    } catch (error) {
      console.log(error);
    }
  };
  const handleInput = (e) => {
    setInputValue((prevValue) => ({
      ...prevValue,
      [e.target.name]: e.target.value,
    }));
  };

  useEffect(() => {
    checkIsWalletConnected();
    getBankName();
    bankOwnerHadler();
    balanceHandler();
  }, [isWalletConnected]);

  return (
    <div className="flex flex-col justify-center items-center p-10 bg-black min-h-screen">
      <div className="bg-[#101626] border rounded-md w-full border-gray-100 flex flex-col lg:flex-row ">
        <div className="p-4 space-y-8 flex-1">
          <div className="text-3xl">
            <span className=" bg-gradient-to-tr from-[#5d5ade] to-[#5b269e] inline-block font-bold text-transparent bg-clip-text">
              Bank Contract Project
            </span>{" "}
            🏦
          </div>
          <p className="px-1 text-2xl font-bold text-white uppercase">
            {bankName.length > 0 ? bankName : "Jack"}'s Bank
          </p>
          <div className="flex flex-col border border-[#37404e] rounded-md text-white">
            <div className="p-3 bg-[#1e2836] ">
              <input
                type="number"
                name="deposit"
                step="0.0001"
                onChange={handleInput}
                value={inputValue.deposit}
                className="w-full bg-transparent outline-none "
                placeholder="Amount ( ex : 0.0000 ETH)"
              />
            </div>
            <button
              className="bg-[#362fa1] p-3 font-bold uppercase w-full"
              onClick={depositHandler}
            >
              Deposit Money in ETH
            </button>
          </div>
          <div className="flex flex-col border border-[#37404e] rounded-md text-white">
            <div className="p-3 bg-[#1e2836] ">
              <input
                type="number"
                name="withdraw"
                step="0.0001"
                onChange={handleInput}
                value={inputValue.withdraw}
                className="w-full bg-transparent outline-none"
                placeholder="Amount ( ex : 0.0000 ETH)"
              />
            </div>
            <button
              className="bg-[#362fa1] p-3 font-bold uppercase w-full"
              onClick={withdrawHandler}
            >
              Withdraw Money in ETH
            </button>
          </div>
        </div>
        <div className="text-white p-4 lg:w-1/2">
          <p>
            <span className="px-1 text-lg font-bold">Customer Balance : </span>
            <span>{customerBalance}</span>
          </p>
          <p>
            <span className="px-1 text-lg font-bold">Bank Owner Address :</span>
            <span>{bankOwner}</span>
          </p>
          {isWalletConnected && (
            <p>
              <span className="px-1 text-lg font-bold">
                Your Wallet Address :
              </span>
              <span>{customerAddress}</span>
            </p>
          )}
          {!isWalletConnected && (
            <div className="py-4">
              <button
                className="bg-[#6366f1] px-8 py-3  font-bold uppercase rounded-lg"
                onClick={checkIsWalletConnected}
              >
                Connect Wallet &nbsp; 🔑
              </button>
            </div>
          )}
          <br />
          {isBankOwner && (
            <div className="flex flex-col border border-[#37404e] rounded-md text-white ">
              <div className="p-3 bg-[#1e2836]">
                <input
                  type="text"
                  name="bankName"
                  value={inputValue.bankName}
                  onChange={handleInput}
                  className="w-full bg-transparent outline-none "
                  placeholder="Example : Jack,Vel.."
                />
              </div>
              <button
                className="bg-[#362fa1] p-3 font-bold w-full"
                onClick={setBankHandler}
              >
                Set New Name for Bank
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
