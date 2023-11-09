import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    ganache: {
      // rpc url, change it according to your ganache configuration
      url: 'http://127.0.0.1:8545',
      // the private key of signers, change it according to your ganache user
      accounts: [
          '0x41c43293162e388f2b930918772304549447d4d6393a8bbe9eabbf9aea5a7c92',
          '0x565b07b453f3a21d25f40afff8570ba49cf4647ce323f3a3b70d4e9cb916b4f9',
          '0x9fe81338f05b67a57c4ca4cb703c768cc4c01d8c9fa77407f2c440cef1ddb1eb',
          '0x479fa33ee795074f32a6247de4920f12c82946664fc9a392b95479946c84f553',
          '0x0ff9c74cffe8997aa790cbf02cb3e178360f251611a265a4699afaa761947fbf',
          '0x0a2513863bae12d7368ed71f2bfae27fa86b0b0cd82a64a264764c0e8756fd51',
          '0x77f79f91abae15eb6dd5e3fbc7168494a6594856fb6e1be4609aab20cfb3b332',
          '0xd2b8cd1d16d3822533223984e4881f1d730c2e7d318ba6c8733325e8082e0b4b',
          '0x53c5a44b8477f7a70502087513f179b45bfa214ee162f42f8ae302e31c70888b',
          '0x9708b4a99e76db74b3ca61ec1a430e71a9ed0578cad9d157316c6b45813c6fbb'
      ]
    },
  },
};

export default config;
