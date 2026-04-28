# $HERO on Base — Verified Contract

**Date Verified**: 2026-04-28
**Source**: https://basescan.org/token/0x00fa69ed03d3337085a6a87b691e8a02d04eb5f8

## Contract Details

| Field | Value |
|-------|-------|
| Contract Address | `0x00fa69ed03d3337085a6a87b691e8a02d04eb5f8` |
| Token Name | HERO Token for Veterans (HERO) |
| Chain | Base (Chain ID: 8453) |
| Decimals | 18 |
| Max Total Supply | 100,000,000 HERO |
| Holders | 52 |
| Transfers | 148 |
| Compiler | Solidity v0.8.26 |
| License | MIT |
| Verified | Yes (Exact Match) |

## Contract Features (from source code)

- ERC20 + ERC20Permit + ERC20Votes (governance-ready)
- Ownable
- Buy-and-burn mechanism (HeroBuyAndBurn contract)
- Fee structure: heroBurnFee, heroAutoLpFee, donationFee, buyAndBurnFee, stakeRewardsFee
- Fee decay over 90 days (starts at 12%, decays to 6%)
- NFT-based fee discount option
- Chainlink price feed integration
- Uniswap V2 router integration
- Auto-liquidity
- Max transaction amount

## Key Addresses (from contract)

- WETH: `0x4200000000000000000000000000000000000006`
- USDC: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`
- Chainlink ETH/USD: `0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70`
- Auto-LP Receiver: `0x43f31993D6025Ab6c39c82850d09972f908C02a8`
- Donation Receiver: `0x94E52915b99FFDD298939f9e0B4a7af80e6789f7`
- Stake Rewards: `0xCFa2b36cc681Ac47f12B1A52d15a690476106a81`
