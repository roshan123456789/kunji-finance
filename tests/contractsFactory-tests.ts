import { ethers, upgrades } from "hardhat";
import {
  Signer,
  ContractFactory,
  ContractTransaction,
  BigNumber,
  utils,
} from "ethers";
import { expect } from "chai";
import Reverter from "./helpers/reverter";
import {
  TraderWallet,
  ContractsFactory,
  AdaptersRegistry,
  AdapterOperations,
  UserVault,
  ERC20Mock,
} from "../typechain-types";
import {
  TEST_TIMEOUT,
  ZERO_AMOUNT,
  ZERO_ADDRESS,
  AMOUNT_100,
} from "./helpers/constants";

const reverter = new Reverter();

let deployer: Signer;
let vault: Signer;
let trader: Signer;
let adaptersRegistry: Signer;
let contractsFactory: Signer;
let dynamicValue: Signer;
let nonAuthorized: Signer;
let otherSigner: Signer;
let owner: Signer;

let deployerAddress: string;
let vaultAddress: string;
let underlyingTokenAddress: string;
let adaptersRegistryAddress: string;
let contractsFactoryAddress: string;
let traderAddress: string;
let dynamicValueAddress: string;
let nonAuthorizedAddress: string;
let otherAddress: string;
let ownerAddress: string;

let txResult: ContractTransaction;
let ContractsFactoryFactory: ContractFactory;
let contractsFactoryContract: ContractsFactory;
let traderWalletContract: TraderWallet;
let usdcTokenContract: ERC20Mock;
let adaptersRegistryContract: AdaptersRegistry;
let contractBalanceBefore: BigNumber;
let contractBalanceAfter: BigNumber;
let traderBalanceBefore: BigNumber;
let traderBalanceAfter: BigNumber;
let feeRate: BigNumber = BigNumber.from(30);

describe("ContractsFactory Tests", function () {
  this.timeout(TEST_TIMEOUT);

  before(async () => {
    const ERC20MockFactory = await ethers.getContractFactory("ERC20Mock");
    usdcTokenContract = (await ERC20MockFactory.deploy(
      "USDC",
      "USDC",
      6
    )) as ERC20Mock;
    await usdcTokenContract.deployed();
    underlyingTokenAddress = usdcTokenContract.address;

    [
      deployer,
      vault,
      trader,
      adaptersRegistry,
      contractsFactory,
      dynamicValue,
      nonAuthorized,
      otherSigner,
    ] = await ethers.getSigners();

    [
      deployerAddress,
      vaultAddress,
      traderAddress,
      adaptersRegistryAddress,
      contractsFactoryAddress,
      dynamicValueAddress,
      nonAuthorizedAddress,
      otherAddress,
    ] = await Promise.all([
      deployer.getAddress(),
      vault.getAddress(),
      trader.getAddress(),
      adaptersRegistry.getAddress(),
      contractsFactory.getAddress(),
      dynamicValue.getAddress(),
      nonAuthorized.getAddress(),
      otherSigner.getAddress(),
    ]);
  });

  describe("Asset Token Deployment Tests", function () {
    describe("GIVEN a Trader Wallet Factory", function () {
      before(async () => {
        ContractsFactoryFactory = await ethers.getContractFactory(
          "ContractsFactory"
        );

        owner = deployer;
        ownerAddress = deployerAddress;
      });

      describe("WHEN trying to deploy ContractsFactory contract with invalid parameters", function () {
        it("THEN it should FAIL when _vaultAddress is ZERO", async () => {
          await expect(
            upgrades.deployProxy(ContractsFactoryFactory, [
              ZERO_ADDRESS,
              feeRate,
            ])
          )
            .to.be.revertedWithCustomError(
              ContractsFactoryFactory,
              "ZeroAddress"
            )
            .withArgs("_adaptersRegistryAddress");
        });
        it("THEN it should FAIL when feeRate is greater than 100", async () => {
          await expect(
            upgrades.deployProxy(ContractsFactoryFactory, [
              otherAddress,
              BigNumber.from(101),
            ])
          ).to.be.revertedWithCustomError(
            ContractsFactoryFactory,
            "FeeRateError"
          );
        });
      });

      describe("WHEN trying to deploy ContractsFactory contract with correct parameters", function () {
        before(async () => {
          const AdapterRegistryFactory = await ethers.getContractFactory(
            "AdaptersRegistry"
          );
          adaptersRegistryContract = (await upgrades.deployProxy(
            AdapterRegistryFactory,
            []
          )) as AdaptersRegistry;
          await adaptersRegistryContract.deployed();

          contractsFactoryContract = (await upgrades.deployProxy(
            ContractsFactoryFactory,
            [adaptersRegistryAddress, feeRate]
          )) as ContractsFactory;
          await contractsFactoryContract.deployed();

          // take a snapshot
          await reverter.snapshot();
        });

        describe("WHEN trying to set the adaptersRegistryAddress", async () => {
          describe("WHEN calling with invalid caller or parameters", function () {
            describe("WHEN caller is not owner", function () {
              it("THEN it should fail", async () => {
                await expect(
                  contractsFactoryContract
                    .connect(nonAuthorized)
                    .setAdaptersRegistryAddress(otherAddress)
                ).to.be.revertedWith("Ownable: caller is not the owner");
              });
            });

            describe("WHEN address is invalid", function () {
              it("THEN it should fail", async () => {
                await expect(
                  contractsFactoryContract
                    .connect(owner)
                    .setAdaptersRegistryAddress(ZERO_ADDRESS)
                )
                  .to.be.revertedWithCustomError(
                    contractsFactoryContract,
                    "ZeroAddress"
                  )
                  .withArgs("_adaptersRegistryAddress");
              });
            });
          });

          describe("WHEN calling with correct caller and address", function () {
            before(async () => {
              txResult = await contractsFactoryContract
                .connect(owner)
                .setAdaptersRegistryAddress(otherAddress);
            });
            after(async () => {
              await reverter.revert();
            });
            it("THEN new address should be stored", async () => {
              expect(
                await contractsFactoryContract.adaptersRegistryAddress()
              ).to.equal(otherAddress);
            });
            it("THEN it should emit an Event", async () => {
              await expect(txResult)
                .to.emit(contractsFactoryContract, "AdaptersRegistryAddressSet")
                .withArgs(otherAddress);
            });
          });
        });

        describe("WHEN trying to set the feeRate", async () => {
          describe("WHEN calling with invalid caller or parameters", function () {
            describe("WHEN caller is not owner", function () {
              it("THEN it should fail", async () => {
                await expect(
                  contractsFactoryContract
                    .connect(nonAuthorized)
                    .setFeeRate(otherAddress)
                ).to.be.revertedWith("Ownable: caller is not the owner");
              });
            });

            describe("WHEN address is invalid", function () {
              it("THEN it should fail", async () => {
                await expect(
                  contractsFactoryContract
                    .connect(owner)
                    .setFeeRate(BigNumber.from(200))
                ).to.be.revertedWithCustomError(
                  ContractsFactoryFactory,
                  "FeeRateError"
                );
              });
            });
          });

          describe("WHEN calling with correct caller and parameter", function () {
            const NEW_FEE_RATE = BigNumber.from(20);
            before(async () => {
              txResult = await contractsFactoryContract
                .connect(owner)
                .setFeeRate(NEW_FEE_RATE);
            });
            after(async () => {
              await reverter.revert();
            });
            it("THEN new feeRate should be stored", async () => {
              expect(await contractsFactoryContract.feeRate()).to.equal(
                NEW_FEE_RATE
              );
            });
            it("THEN it should emit an Event", async () => {
              await expect(txResult)
                .to.emit(contractsFactoryContract, "FeeRateSet")
                .withArgs(NEW_FEE_RATE);
            });
          });
        });
      });
    });
  });
});
