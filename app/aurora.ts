// app/aurora.ts
import CoinbaseWalletSDK from "@coinbase/wallet-sdk";
import {
  createPublicClient,
  http,
  formatEther,
  isAddress,
  getAddress,
  hexToBigInt,
} from "viem";
import { baseSepolia } from "viem/chains";

type Addr = `0x${string}`;

const NET = {
  name: "Base Sepolia",
  chainId: 84532,
  rpcUrl: "https://sepolia.base.org",
  explorer: "https://sepolia.basescan.org",
};

const sdk = new CoinbaseWalletSDK({
  appName: "Aurora (Built for Base)",
  appLogoUrl: "https://base.org/favicon.ico",
});

const client = createPublicClient({
  chain: baseSepolia,
  transport: http(NET.rpcUrl),
});

function toAddr(v: string): Addr {
  if (!isAddress(v)) throw new Error(`Invalid address: ${v}`);
  return getAddress(v) as Addr;
}

function linkAddress(a: Addr) {
  return `${NET.explorer}/address/${a}`;
}

function linkCode(a: Addr) {
  return `${NET.explorer}/${a}/0#code`;
}

async function connectWallet(): Promise<Addr> {
  const provider = sdk.makeWeb3Provider(NET.rpcUrl, NET.chainId);
  const accounts = (await provider.request({
    method: "eth_requestAccounts",
  })) as string[];
  return toAddr(accounts[0]);
}

async function getNetworkSnapshot() {
  const [block, gasPrice] = await Promise.all([
    client.getBlock(),
    client.getGasPrice(),
  ]);

  return {
    blockNumber: block.number,
    timestamp: block.timestamp,
    gasUsed: block.gasUsed,
    gasLimit: block.gasLimit,
    gasPrice,
  };
}

async function inspect(a: Addr) {
  const [bal, nonce, bytecode] = await Promise.all([
    client.getBalance({ address: a }),
    client.getTransactionCount({ address: a }),
    client.getBytecode({ address: a }),
  ]);

  return {
    address: a,
    balanceEth: formatEther(bal),
    nonce,
    hasCode: !!bytecode,
  };
}

async function rawCallUint256(target: Addr, selector4: `0x${string}`) {
  const data = selector4.slice(0, 10) as `0x${string}`;
  const res = await client.call({ to: target, data });
  if (!res.data || res.data === "0x") return null;
  try {
    return hexToBigInt(res.data);
  } catch {
    return null;
  }
}

function section(title: string) {
  const bar = "—".repeat(Math.max(14, title.length));
  console.log(`\n${title}\n${bar}`);
}

async function run() {
  console.log("Aurora — read-only inspector");
  console.log(`Network: ${NET.name}`);
  console.log(`chainId: ${NET.chainId}`);
  console.log(`RPC: ${NET.rpcUrl}`);

  const wallet = await connectWallet();
  const [snap, walletInfo] = await Promise.all([
    getNetworkSnapshot(),
    inspect(wallet),
  ]);

  section("Wallet");
  console.log("Address:", walletInfo.address);
  console.log("Balance:", walletInfo.balanceEth, "ETH");
  console.log("Tx count:", walletInfo.nonce);
  console.log("Has code:", walletInfo.hasCode ? "yes" : "no");
  console.log("Explorer:", linkAddress(walletInfo.address));

  section("Network snapshot");
  console.log("Latest block:", snap.blockNumber);
  console.log("Timestamp:", snap.timestamp);
  console.log("Gas used / limit:", snap.gasUsed.toString(), "/", snap.gasLimit.toString());
  console.log("Gas price:", snap.gasPrice.toString());

  const probes: Addr[] = [
    "0x7cA1b2d3E4f5061728394aBcDeF0123456789aBc",
    "0x19f0A3bC4dE567890123456789aBCdEf01234567",
    "0xB4cD3eF0123456789aBCdEf019f0A3bC4dE56789",
  ].map(toAddr);

  section("Testnet contract probes");
  for (const p of probes) {
    const info = await inspect(p);
    console.log("Contract:", info.address);
    console.log("Has code:", info.hasCode ? "yes" : "no");
    console.log("Balance:", info.balanceEth, "ETH");
    console.log("Deployment:", linkAddress(info.address));
    console.log("Verification:", linkCode(info.address));
    console.log("---");
  }

  section("Optional raw eth_call check");
  console.log("Target:", probes[0]);
  console.log("Selector:", "0x18160ddd (totalSupply())");
  const maybe = await rawCallUint256(
    probes[0],
    "0x18160ddd00000000000000000000000000000000000000000000000000000000"
  );
  console.log("Result:", maybe === null ? "no data / not supported" : maybe.toString());
  console.log("Note:", "This is a raw eth_call (no ABI).");

  section("Done");
  console.log("No transactions were signed or broadcast.");
}

run().catch((e) => {
  console.error("Fatal:", e?.message ?? e);
  process.exitCode = 1;
});
