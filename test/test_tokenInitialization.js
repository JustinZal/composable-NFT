const { expect } = require("chai");

const AMOUNT = ethers.utils.parseEther('10');
const ID = 99;

describe("Token initialization", function() {
    it("ERC20 minting should work correctly", async () => {
        const signers = await ethers.getSigners();
        const receiver = signers[1];

        const MyERC20 = await ethers.getContractFactory("MyERC20");
        const erc20 = await MyERC20.deploy();
        await erc20.deployed();

        await erc20.mint(receiver.address, AMOUNT);
        expect(await erc20.balanceOf(receiver.address)).to.equal(AMOUNT.toString());
    });
    it("ERC721 minting should work correctly", async () => {
        const signers = await ethers.getSigners();
        const receiver = signers[1];

        const MyComposableNFT = await ethers.getContractFactory("MyComposableNFT");
        const myComposableNFT = await MyComposableNFT.deploy();
        await myComposableNFT.deployed();

        await myComposableNFT.mint(receiver.address, ID);
        expect(await myComposableNFT.ownerOf(ID)).to.equal(receiver.address);
    });
});
