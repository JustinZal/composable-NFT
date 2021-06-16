const {expect} = require("chai");

//Shorthand funciton to deploy and mint ERC20 token
const initializeERC20 = async (amount, receiverAddress) => {
    const MyERC20 = await ethers.getContractFactory("MyERC20");
    const erc20 = await MyERC20.deploy();
    await erc20.deployed();
    await erc20.mint(receiverAddress, amount);

    return erc20;
};

//Shorthand function to deploy and mint the NFT token
const initializeERC721 = async (id, receiver) => {
    const MyComposableNFT = await ethers.getContractFactory("MyComposableNFT");
    const myComposableNFT = await MyComposableNFT.deploy();
    await myComposableNFT.deployed();
    await myComposableNFT.mint(receiver, id);

    return myComposableNFT;
}

//Shorthand function to deposit tokens to NFT contract
const depositToken = async (to, erc20, erc721, amount, tokenId) => {
    await erc20.connect(to).approve(erc721.address, amount);
    await erc721.connect(to).getERC20(to.address, tokenId, erc20.address, amount);
};

//Shorthand function to deploy mocked ERC223 token
const getMockedERC223 = async addressNFT => {
    const MockedERC223 = await ethers.getContractFactory("MockedERC223");
    const mockedERC223 = await MockedERC223.deploy(addressNFT);
    await mockedERC223.deployed();

    return mockedERC223;
}

const TOKEN_ID = '42';
let erc20Token, erc721Token;

describe("Token transfers", function () {
    it("ERC20 approve transfer should work correctly", async () => {
        const signers = await ethers.getSigners();
        const receiver = signers[1];
        const mintAmount = ethers.utils.parseEther('10');

        //Fetch both tokens
        erc20Token = await initializeERC20(mintAmount.toString(), receiver.address);
        erc721Token = await initializeERC721(TOKEN_ID, receiver.address);

        //Make sure the balance is empty before
        expect(await erc721Token.balanceOfERC20(TOKEN_ID, erc20Token.address)).to.equal('0');

        //Deposit tokens
        const transferAmount = ethers.utils.parseEther('7');
        await depositToken(receiver, erc20Token, erc721Token, transferAmount, TOKEN_ID);

        //Perform ERC721 and ERC20 balance checks
        expect(await erc721Token.balanceOfERC20(TOKEN_ID, erc20Token.address)).to.equal(transferAmount.toString());
        expect(await erc20Token.balanceOf(erc721Token.address)).to.equal(transferAmount.toString());
    });

    it("Transfer tokens from NFT to address should work correctly", async () => {
        const signers = await ethers.getSigners();
        const [receiver, sender] = signers;

        //Make sure the balance is empty before
        expect(await erc20Token.balanceOf(receiver.address)).to.equal('0');

        //Transfer token outside of NFT
        const transferAmount = ethers.utils.parseEther('5');
        await erc721Token.connect(sender).transferERC20(TOKEN_ID, receiver.address, erc20Token.address, transferAmount);

        //Perform ERC721 and ERC20 balance checks
        const expectedBalance = ethers.utils.parseEther('2');
        expect(await erc20Token.balanceOf(receiver.address)).to.equal(transferAmount.toString());
        expect(await erc20Token.balanceOf(erc721Token.address)).to.equal(expectedBalance.toString());
        expect(await erc721Token.balanceOfERC20(TOKEN_ID, erc20Token.address)).to.equal(expectedBalance.toString());
    });

    it("Transfer tokens via ERC223 should work correctly", async () => {
        const mockedERC223 = await getMockedERC223(erc721Token.address);

        const [sender] = await ethers.getSigners();
        const value = ethers.utils.parseEther('10');
        const tokenId = ethers.utils.hexValue(Number(TOKEN_ID));

        //Mock ERC223 notify transfer and perform checks
        expect(await erc721Token.balanceOfERC20(TOKEN_ID, mockedERC223.address)).to.equal('0');
        await mockedERC223.notifyTransfer(sender.address, value, tokenId);
        expect(await erc721Token.balanceOfERC20(TOKEN_ID, mockedERC223.address)).to.equal(value.toString());

        const data = ethers.utils.hexValue(100);
        const [to, from] = await ethers.getSigners();
        //Transfer tokens outside NFT
        await erc721Token.connect(from).transferERC223(TOKEN_ID, to.address, mockedERC223.address, value, data);

        //Here only NFT balance check is possible, because the transfer is only mocked
        expect(await erc721Token.balanceOfERC20(TOKEN_ID, mockedERC223.address)).to.equal('0');
    });
});
