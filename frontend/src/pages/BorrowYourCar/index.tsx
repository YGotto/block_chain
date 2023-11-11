import {Button, Image} from 'antd';
import {Header} from "../../asset";
import {UserOutlined} from "@ant-design/icons";
import {useEffect, useState} from 'react';
import {borrowYourCarContract, myERC20Contract, web3} from "../../utils/contracts";
import './index.css';
const GanacheTestChainId = '5777' // Ganache默认的ChainId = 0x539 = Hex(1337)
// TODO change according to your configuration
const GanacheTestChainName = 'TEST'
const GanacheTestChainRpcUrl = 'http://127.0.0.1:8545'
const BorrowYourCarPage=()=>{

    const images = [
        require('./pictures/0.png'),
        require('./pictures/1.png'),
        require('./pictures/2.png'),
        require('./pictures/3.png'),
        require('./pictures/4.png'),
        require('./pictures/5.png'),
        require('./pictures/6.png'),
        require('./pictures/7.png'),
        require('./pictures/8.png'),
        require('./pictures/9.png'),
    ]

    const [account, setAccount] = useState('')
    const [accountBalance, setAccountBalance] = useState(0)
    const [managerAccount, setManagerAccount] = useState('')
    const[perHourCost,setPerHourCost]=useState('')
    const[perCarCost,setPerCarCost]=useState('')
    const[myCarList,setMyCarList]=useState([])
    const[availableCarList,setAvailableCarList]=useState([])
    const[carIdForSearch,setCarIdForSearch]=useState('')
    const[owner,setOwner]=useState('')
    const[borrower,setBorrower]=useState('')
    const[borrowHour,setBorrowHour]=useState('')
    const[carIdForBorrow,setCarIdForBorrow]=useState('')

    const[myCarListState,setMyCarListState]=useState(false)
    const[availableCarListState,setAvailableCarListState]=useState(false)
    const[searchState,setSearchState]=useState(false)
    const[borrowState,setBorrowState]=useState(false)


    const handleMyCarListState=()=>{
        setMyCarListState(true);
    };
    const reHandleMyCarListState=()=>{
        setMyCarListState(false);
    }
    const handleAvailableCarList=()=>{
        setAvailableCarListState(true)
    }
    const reHandleAvailableCarList=()=>{
        setAvailableCarListState(false);
    }
    const handleSearchState=()=>{
        setSearchState(true)
    }
    const reHandleSearchState=()=>{
        setSearchState(false)
    }
    const handleBorrowState=()=>{
        setBorrowState(true)
    }
    const reHandleBorrowState=()=>{
        setBorrowState(false)
    }


    useEffect(() => {
        // 初始化检查用户是否已经连接钱包
        // 查看window对象里是否存在ethereum（metamask安装后注入的）对象
        const initCheckAccounts = async () => {
            // @ts-ignore
            const {ethereum} = window;
            if (Boolean(ethereum && ethereum.isMetaMask)) {
                // 尝试获取连接的用户账户
                const accounts = await web3.eth.getAccounts()
                if(accounts && accounts.length) {
                    setAccount(accounts[0])
                }
            }
        }

        initCheckAccounts()
    }, [])

    useEffect(() => {
        const getAccountInfo = async () => {
            if (myERC20Contract) {
                const ab = await myERC20Contract.methods.balanceOf(account).call()
                setAccountBalance(ab)
            } else {
                alert('Contract not exists.')
            }
        }

        if(account !== '') {
            getAccountInfo()
        }
    }, [account])
    //获得ERC20信息
    const onClaimTokenAirdrop = async () => {
        if(account === '') {
            alert('You have not connected wallet yet.')
            return
        }

        if (myERC20Contract) {
            try {
                await myERC20Contract.methods.airdrop().send({
                    from: account,
                    gasLimit:6721975
                })
                alert('You have claimed OTTO Token.')
            } catch (error: any) {
                alert(error.message)
            }

        } else {
            alert('Contract not exists.')
        }
    }

    const onClickConnectWallet = async () => {
        // 查看window对象里是否存在ethereum（metamask安装后注入的）对象
        // @ts-ignore
        const {ethereum} = window;
        if (!Boolean(ethereum && ethereum.isMetaMask)) {
            alert('MetaMask is not installed!');
            return
        }

        try {
            // 如果当前小狐狸不在本地链上，切换Metamask到本地测试链
            if (ethereum.chainId !== GanacheTestChainId) {
                const chain = {
                    chainId: GanacheTestChainId, // Chain-ID
                    chainName: GanacheTestChainName, // Chain-Name
                    rpcUrls: [GanacheTestChainRpcUrl], // RPC-URL
                };

                try {
                    // 尝试切换到本地网络
                    await ethereum.request({method: "wallet_switchEthereumChain", params: [{chainId: chain.chainId}]})
                } catch (switchError: any) {
                    // 如果本地网络没有添加到Metamask中，添加该网络
                    if (switchError.code === 4902) {
                        await ethereum.request({ method: 'wallet_addEthereumChain', params: [chain]
                        });
                    }
                }
            }

            // 小狐狸成功切换网络了，接下来让小狐狸请求用户的授权
            await ethereum.request({method: 'eth_requestAccounts'});
            // 获取小狐狸拿到的授权用户列表
            const accounts = await ethereum.request({method: 'eth_accounts'});
            // 如果用户存在，展示其account，否则显示错误信息
            setAccount(accounts[0] || 'Not able to get accounts');
        } catch (error: any) {
            alert(error.message)
        }
    }

    //获得条约信息
    useEffect(() => {
        const getContractInfo = async () => {
            if (borrowYourCarContract) {
                const _ma = await borrowYourCarContract.methods.getManager().call()
                const ma=_ma.toString()
                setManagerAccount(ma);
                const pcc = await borrowYourCarContract.methods.getPerCarCost().call()
                setPerCarCost(pcc.toString());
                const phc = await borrowYourCarContract.methods.getPerHourCost().call()
                setPerHourCost(phc.toString());
            } else {
                alert('Contract not exists.')
            }
        }

        getContractInfo()
    }, [])
//购买车辆
    const onBuyCar=async()=>{
        if(account===''){
            alert('You have not connected wallet yet.')
            return
        }
        if(borrowYourCarContract&&myERC20Contract) {
            try {
                await borrowYourCarContract.methods.mintCar().send(
                    {
                        from: account,
                        value: perCarCost,
                        timestamp: new Date().getTime() / 1000,
                        gaslimit:6721975
                    }
                )
                alert('succeed to mint a car')
            }catch(error:any){
                alert(error.message)
            }
        }else{
            alert('Contract not exists.')
        }
    }
    //显示自己已经有的车辆
    const onGetMyCarList=async()=>{
        if(account===''){
            alert('You have not connected wallet yet.')
            return
        }
        if(borrowYourCarContract){
            try{
                await borrowYourCarContract.methods.getMyCarList().send(
                    {
                        from:account,
                        gaslimit:6721975
                    }
                )
            }catch(error:any){
                alert(error.message)
            }
        }else{
                alert('Contract not exists.')
        }

    }
    //侦听事件来获得我的车辆列表
    useEffect(()=>{
    if(borrowYourCarContract){
        borrowYourCarContract.events.GetMyCarList()
            .on('data',(event:any)=>{
                const MyCars=event.returnValues[0];
                setMyCarList(MyCars);
                console.log(MyCars);
                handleMyCarListState();
                }
            )
            .on('error',(error:any)=>{
                console.log(error)
                }
            )
    }
        },[borrowYourCarContract]
    );
    //查看空闲车辆
    const onGetAvailableCarList=async()=>{
        if(account===''){
            alert('You have not connected wallet yet.')
            return
        }
        if(borrowYourCarContract){
            try{
                await borrowYourCarContract.methods.getAvailableCars().send(
                    {
                        from:account,
                        gasLimit:6721975
                    }
                )
            }catch(error:any){
                alert(error.message)
            }
        }else{
            alert('Contract not exists.')
        }
    }
    //侦听事件来获得空闲车辆列表
    useEffect(()=>{
            if(borrowYourCarContract){
                borrowYourCarContract.events.GetAvailableCars()
                    .on('data',(event:any)=>{
                            const AvailableCars=event.returnValues[0];
                            setAvailableCarList(AvailableCars);
                            console.log(AvailableCars);
                            handleAvailableCarList();
                        }
                    )
                    .on('error',(error:any)=>{
                            console.log(error)
                        }
                    )
            }
        },[borrowYourCarContract]
    );
    //查询车辆主人和借用者
    const onGetOwnerAndBorrower=async()=>{
        if(account===''){
            alert('You have not connected wallet yet.')
            return
        }
        if(borrowYourCarContract){
            try{
                const carOwner=await borrowYourCarContract.methods.getCarOwner(parseInt(carIdForSearch)).call()
                setOwner(carOwner.toString())
                const carBorrower=await borrowYourCarContract.methods.getCarBorrower(parseInt(carIdForSearch)).call()
                setBorrower(carBorrower.toString())
            }catch(error:any){
                alert(error.message)
            }
        }else{
            alert('Contract not exists.')
        }
    }
    //借车
    const onBorrow=async()=>{
        if(account===''){
            alert('You have not connected wallet yet.')
            return
        }
        if(borrowYourCarContract&&myERC20Contract){
            try{
                await myERC20Contract.methods.approve(borrowYourCarContract.options.address,parseInt(perHourCost)).send(
                    {
                        from:account,
                        gasLimit:6724975
                    }
                )
                await borrowYourCarContract.methods.carBorrowed(carIdForBorrow,borrowHour).send(
                    {
                        from:account,
                        timestamp:new Date().getTime()/1000,
                        gasLimit:6721975
                    }
                )
            }catch(error:any){
                alert(error.message)
            }
        }else{
            alert('Contract not exists.')
        }
    }

    function showCars(carList:string[]) {
        return carList.map((imageName, index) => {
            const imageSrc = images[parseInt(imageName, 10)];
            return (
                <div key={index}>
                    <img src={imageSrc}
                         width='200px'
                         height='150px'
                         alt={imageName}/>
                    <p>{imageName}</p>
                </div>
            );
        });
    }
    function showSearchResult(){
        return(
            <div>
                <p>汽车拥有者:{owner}</p>
                <p>汽车使用者：{borrower}</p>
                <Button onClick={reHandleSearchState}>关闭</Button>
            </div>
        )
    }

        return(
        <div className={'container'}>
            <Image
                width='100%'
                height='150px'
                preview={false}
                src={Header}
            />
            <div className={'main'}>
                <h1>OTTO币汽车租赁系统</h1>
                <h2>当前汽车价格：{perCarCost}</h2><h2>当前租赁价格：{perHourCost}元/时</h2>
                <Button onClick={onClaimTokenAirdrop}>领取OTTO币空投</Button>
                <div>管理员地址：{managerAccount}</div>
                <div className='account'>
                     <Button onClick={onClickConnectWallet}>连接钱包</Button>
                    <div>当前用户：{account === '' ? '无用户连接' : account}</div>
                    <div>当前用户拥有OTTO币数量：{account === '' ? 0 : accountBalance}</div>
                </div>
                <div>
                    <Button onClick={onBuyCar}>购买汽车</Button>
                </div>
                <div>
                    <Button onClick={onGetMyCarList}>查看我的汽车</Button>
                    {myCarListState&&showCars(myCarList)}
                    {myCarListState&&(
                        <div>
                            <Button onClick={reHandleMyCarListState}>关闭</Button>
                        </div>
                    )
                    }
                </div>
                <div>
                    <Button onClick={onGetAvailableCarList}>查看当前可用汽车</Button>
                    {availableCarListState&&showCars(availableCarList)}
                    {availableCarListState&&(
                        <div>
                            <Button onClick={reHandleAvailableCarList}>关闭</Button>
                        </div>
                    )
                    }
                </div>
                <div>
                    <Button onClick={handleSearchState}>查看汽车主人和借用者</Button>
                    {searchState&&(
                        <div>
                            请输入汽车ID
                            <input style={{width: '30px',margin: '5px'}} onChange={(e) => setCarIdForSearch(e.target.value)}/>
                            <Button onClick={onGetOwnerAndBorrower}>查询</Button>
                            {showSearchResult()}
                        </div>

                    )
                    }
                </div>
                <div>
                    <Button onClick={handleBorrowState}>租赁汽车</Button>
                    {borrowState&&(
                        <div>
                            请输入借用的汽车ID
                            <input style={{width: '30px',margin: '5px'}} onChange={(e) => setCarIdForBorrow(e.target.value)}/>
                            请输入借用的小时数
                            <input style={{width: '30px',margin: '5px'}} onChange={(e) => setBorrowHour(e.target.value)}/>
                            <Button onClick={onBorrow}>借用</Button>
                            <Button onClick={reHandleBorrowState}>关闭</Button>
                        </div>
                    )
                    }
                </div>

            </div>
        </div>

    )
}
export default BorrowYourCarPage