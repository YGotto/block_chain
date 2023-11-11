// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;
import "./ERC4907.sol";
import "./MyERC20.sol";
// Uncomment the line to use openzeppelin/ERC721
// You can use this dependency directly because it has been installed by TA already
// import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract BorrowYourCar is ERC4907{
    // use a event if you want
    // to represent time you can choose block.timestamp
    event MintCar(uint256 carTokenId);
    event GetMyCarList(uint256[]);
    event GetAvailableCars(uint256[]);
    event CarBorrowed(uint256 carTokenId, address borrower, uint256 startTime, uint256 duration);
    // maybe you need a struct to store car information
    struct Car {
        address owner;
        address borrower;
        uint256 borrowUntil;
    }
    uint256 public perHourCost=10;
    uint256 public nextCarId=0;
    uint256 public perCarCost=10;
    address public manager;
    mapping(uint256 => Car) public cars; // A map from car index to its information
    mapping(address => uint256[])public ownerCarList;
    MyERC20 public myERC20;
    // ...
    // TODO add any variables if you want

    constructor() ERC4907("OTTONFT","OTTONFTSymbol"){
        // maybe you need a constructor
        myERC20=new MyERC20("OTTOToken","OTTOTokenSymbol");
        manager=msg.sender;
    }
    function getManager()public view returns(address){
        return manager;
    }
    function getPerCarCost()public view returns(uint256){
        return perCarCost;
    }
    function getPerHourCost()public view returns(uint256){
        return perHourCost;
    }
    //铸造汽车NFT
    function mint(uint256 CarId,address to)public{
        _mint(to,CarId);
    }
    function mintCar()external payable{
        require(msg.value>=perCarCost,"lack of funds");
        mint(nextCarId,msg.sender);
        cars[nextCarId].owner=msg.sender;
        cars[nextCarId].borrowUntil=block.timestamp;
        ownerCarList[msg.sender].push(nextCarId);
        nextCarId++;
        payable(manager).transfer(perCarCost);
        emit MintCar(nextCarId-1);
    }
    //查询自己所拥有的的汽车
    function getMyCarList() public returns(uint256[] memory myCarList){
        myCarList=ownerCarList[msg.sender];
        emit GetMyCarList(myCarList);
    }
    //查看当前还未被借用的汽车列表
    function getAvailableCars()public returns(uint[] memory availableCars){
        uint count=0;
        for(uint i=0;i<nextCarId;i++){
            if(block.timestamp>cars[i].borrowUntil){
                count++;
            }
        }
        uint256[] memory result=new uint256[](count);
        uint j=0;
        for(uint256 i=0;i<nextCarId;i++){
            if(block.timestamp>cars[i].borrowUntil){
                result[j]=i;
                j++;
            }
        }
        emit GetAvailableCars(result);
        return result;

    }
    //查询一辆汽车的主人
    function getCarOwner(uint carId)public view returns(address owner){
        require(carId<nextCarId,"No such car!");
        owner=cars[carId].owner;
    }
    //查询一辆汽车的借用者
    function getCarBorrower(uint carId)public view returns(address borrower){
        require(carId<nextCarId,"No such car!");
        borrower=userOf(carId);
    }
    //选择并借用某辆还没有被租借的汽车一定时间
    function carBorrowed(uint256 carId,uint256 hour)external{
        uint256 cost=hour*perHourCost;
        require(carId<nextCarId,"No such car!");
        require(block.timestamp>cars[carId].borrowUntil,"Not available");
        require(cost<=myERC20.balanceOf(msg.sender),"lack of funds");
        setUser(carId,msg.sender,uint64(block.timestamp+hour*3600));
        cars[carId].borrowUntil=block.timestamp+hour*3600;
        cars[carId].borrower=msg.sender;
        myERC20.transferFrom(msg.sender,cars[carId].owner,cost);
        emit CarBorrowed(carId,msg.sender,block.timestamp,hour);
    }
    // ...
    // TODO add any logic if you want
}