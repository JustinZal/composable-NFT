const { expect } = require("chai");
const { random } = require("lodash");

const initializeERC20 = async (amount, receiverAddress) => {
    const MyERC20 = await ethers.getContractFactory("MyERC20");
    const erc20 = await MyERC20.deploy();
    await erc20.deployed();
    await erc20.mint(receiverAddress, amount);

    return erc20;
};

const initializeERC721 = async (id, receiver) => {
    const MyComposableNFT = await ethers.getContractFactory("MyComposableNFT");
    const myComposableNFT = await MyComposableNFT.deploy();
    await myComposableNFT.deployed();
    await myComposableNFT.mint(receiver, id);

    return myComposableNFT;
}

describe("Token transfers", function() {
    it("ERC20 approve transfer should work correctly", async () => {
        const signers = await ethers.getSigners();
        const receiver = signers[1];
        const mintAmount = ethers.utils.parseEther('10');
        const tokenId = random(1, 100);

        const erc20Token = await initializeERC20(mintAmount.toString(), receiver.address);
        const erc721Token = await initializeERC721(tokenId, receiver.address);

        expect(await erc721Token.balanceOfERC20(tokenId, erc20Token.address)).to.equal('0');

        const transferAmount = ethers.utils.parseEther('7');
        await erc20Token.connect(receiver).approve(erc721Token.address, transferAmount);
        await erc721Token.connect(receiver).getERC20(receiver.address, tokenId, erc20Token.address, transferAmount);

        expect(await erc721Token.balanceOfERC20(tokenId, erc20Token.address)).to.equal(transferAmount.toString());
    });
});
