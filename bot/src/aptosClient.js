import { AptosClient, AptosAccount } from "aptos";
import fetch from "node-fetch";

// Initialize the Aptos client
const client = new AptosClient("https://fullnode.mainnet.aptoslabs.com/v1");

// Constants for contract addresses and modules
const MODULES_ACCOUNT =
  "0x190d44266241744264b964a37b8f09863167a12d3e70cda39376cfb4e3561e12";
const SCRIPTS_V2 = "scripts_v2";
const CURVE_TYPE = "Uncorrelated";
const LIQUIDITY_POOL_MODULE = `${MODULES_ACCOUNT}::scripts_v2`;

// Function to convert a hexadecimal string to a Uint8Array (used for private key conversion)
function hexToUint8Array(hexString) {
  if (hexString.startsWith("0x")) {
    hexString = hexString.slice(2);
  }
  const byteArray = new Uint8Array(
    hexString.match(/.{1,2}/g).map((byte) => parseInt(byte, 16))
  );
  return byteArray;
}

// Function to register an account for a specific CoinType on the Aptos blockchain
const registerCoin = async (account, coinType) => {
  const payload = {
    type: "entry_function_payload",
    function: "0x1::managed_coin::register",
    type_arguments: [coinType],
    arguments: [],
  };

  try {
    const txnRequest = await client.generateTransaction(
      account.address(),
      payload
    );
    const signedTxn = await client.signTransaction(account, txnRequest);
    const transactionRes = await client.submitTransaction(signedTxn);
    await client.waitForTransaction(transactionRes.hash);

    console.log(`Account registered for ${coinType}`);
    return transactionRes;
  } catch (error) {
    console.error("Error registering coin:", error);
    throw error;
  }
};

// Function to get the reserves of a liquidity pool from the LiquidSwap API
async function getPoolReserves(fromToken, toToken) {
  const response = await fetch("https://api.liquidswap.com/pools/registered");
  const pools = await response.json();

  const pool = pools.find(
    (pool) =>
      (pool.coinX.type === fromToken && pool.coinY.type === toToken) ||
      (pool.coinX.type === toToken && pool.coinY.type === fromToken)
  );

  if (!pool) {
    throw new Error("Liquidity pool not found");
  }

  const x_reserve =
    pool.coinX.type === fromToken ? pool.coinX.reserve : pool.coinY.reserve;
  const y_reserve =
    pool.coinY.type === toToken ? pool.coinY.reserve : pool.coinX.reserve;

  return { x_reserve, y_reserve, pool };
}

// Function to create a swap transaction payload
function createSwapTransactionPayload({
  fromToken,
  toToken,
  fromAmount,
  toAmount,
}) {
  return {
    type: "entry_function_payload",
    function: `${MODULES_ACCOUNT}::${SCRIPTS_V2}::swap`,
    type_arguments: [
      fromToken,
      toToken,
      "0x190d44266241744264b964a37b8f09863167a12d3e70cda39376cfb4e3561e12::curves::Uncorrelated",
    ],
    arguments: [fromAmount.toString(), toAmount.toString()],
  };
}

async function getCreationNumberForEventType(address, eventType) {
  const url = `https://fullnode.mainnet.aptoslabs.com/v1/accounts/${address}/resources`;

  try {
    const response = await fetch(url);
    const resources = await response.json();

    console.log("Resources:", JSON.stringify(resources, null, 2));

    const resource = resources.find((r) => r.type === eventType);
    if (!resource) {
      throw new Error(`Event type ${eventType} not found`);
    }

    const depositEvent = resource.data.deposit_events.guid.id.creation_num;
    const withdrawEvent = resource.data.withdraw_events.guid.id.creation_num;
    return { depositEvent, withdrawEvent };
  } catch (error) {
    console.error("Error fetching events:", error);
    throw error;
  }
}

// Function to perform a token swap on the Aptos blockchain
export async function swapTokens(fromToken, toToken, amount, account) {
  try {
    const slippage = 0.005; // Set slippage to 0.5%
    const { x_reserve, y_reserve, pool } = await getPoolReserves(
      fromToken,
      toToken
    );

    if (amount > x_reserve) {
      throw new Error("Insufficient reserves in the pool for the swap");
    }

    // Calculate the minimum amount out based on the pool's reserves and slippage
    const amountInWithDecimals = amount * Math.pow(10, pool.coinX.decimals);
    const amountOut =
      (y_reserve * amountInWithDecimals) / (x_reserve + amountInWithDecimals);
    const minAmountOutWithSlippage = Math.floor(amountOut * (1 - slippage));

    const formattedAmount = amountInWithDecimals.toString();
    const formattedMinAmountOut = minAmountOutWithSlippage.toString();

    console.log(
      `Swapping ${amount} (${formattedAmount}) of ${fromToken} for ${formattedMinAmountOut} of ${toToken} with slippage ${slippage}`
    );

    const txPayload = createSwapTransactionPayload({
      fromToken: fromToken,
      toToken: toToken,
      fromAmount: formattedAmount,
      toAmount: formattedMinAmountOut,
    });

    console.log("Generated Payload:", txPayload);

    const txnRequest = await client.generateTransaction(
      account.address(),
      txPayload
    );
    const signedTxn = await client.signTransaction(account, txnRequest);
    const transactionRes = await client.submitTransaction(signedTxn);
    await client.waitForTransaction(transactionRes.hash);

    return transactionRes;
  } catch (error) {
    console.error("Error during swap:", error);
    throw error;
  }
}

// Function to create an add liquidity transaction payload
function createAddLiquidityPayload({
  fromToken,
  toToken,
  fromAmount,
  toAmount,
}) {
  return {
    type: "entry_function_payload",
    function: `${LIQUIDITY_POOL_MODULE}::add_liquidity`,
    type_arguments: [
      fromToken,
      toToken,
      `${MODULES_ACCOUNT}::curves::${CURVE_TYPE}`,
    ],
    arguments: ["10000", "9950", "10000", "9950"],
  };
}

// Function to add liquidity to the pool
async function addLiquidity(fromToken, toToken, amountX, amountY, account) {
  const payload = createAddLiquidityPayload({
    fromToken,
    toToken,
    fromAmount: amountX,
    toAmount: amountY,
  });

  try {
    const txnRequest = await client.generateTransaction(
      account.address(),
      payload
    );
    const addLiquidityBcsTxn = await client.signTransaction(
      account,
      txnRequest
    );
    const { hash: addLiquidityHash } = await client.submitTransaction(
      addLiquidityBcsTxn
    );
    await client.waitForTransaction(addLiquidityHash);

    console.log(
      `Add liquidity transaction with hash ${addLiquidityHash} is submitted`
    );
    console.log(
      `Check on explorer: https://explorer.aptoslabs.com/txn/${addLiquidityHash}?network=mainnet`
    );
    return addLiquidityHash;
  } catch (error) {
    console.error("Error adding liquidity:", error);
    throw error;
  }
}

// Function to create a burn liquidity transaction payload
function createBurnLiquidityPayload({
  fromToken,
  toToken,
  burnAmount,
  minAmountsOut,
}) {
  return {
    type: "entry_function_payload",
    function: `${LIQUIDITY_POOL_MODULE}::remove_liquidity`,
    type_arguments: [
      fromToken,
      toToken,
      `${MODULES_ACCOUNT}::curves::${CURVE_TYPE}`,
    ],
    arguments: ["6847", "9900", "9912"],
  };
}

// Function to remove liquidity from the pool
async function removeLiquidity(
  fromToken,
  toToken,
  burnAmount,
  minAmountsOut,
  account
) {
  const payload = createBurnLiquidityPayload({
    fromToken,
    toToken,
    burnAmount,
    minAmountsOut,
  });

  try {
    const txnRequest = await client.generateTransaction(
      account.address(),
      payload
    );
    const signedTxn = await client.signTransaction(account, txnRequest);

    const { hash: removeLiquidityHash } = await client.submitTransaction(
      signedTxn
    );
    await client.waitForTransaction(removeLiquidityHash);

    console.log(`Liquidity removed from the pool`);

    console.log(
      `Check on explorer: https://explorer.aptoslabs.com/txn/${removeLiquidityHash}?network=mainnet`
    );
    return removeLiquidityHash;
  } catch (error) {
    console.error("Error removing liquidity:", error);
    throw error;
  }
}

// Function to get the details of a transaction by its hash
async function getTransactionDetails(txnHash) {
  const txn = await client.getTransactionByHash(txnHash);
  return txn;
}

// Function to get all resources for an account
async function getResources(accountAddress) {
  const response = await client.getAccountResources(accountAddress);
  return response;
}

async function getLPTokenBalance(account) {
  try {
    const address = account.address();
    const url = `https://fullnode.mainnet.aptoslabs.com/v1/accounts/${address}/resources`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    const resource = data.find(
      (resource) =>
        resource.type ===
        "0x1::coin::CoinStore<0x5a97986a9d031c4567e15b797be516910cfcb4156312482efc6a19c0a30c948::lp_coin::LP<0x5e156f1207d0ebfa19a9eeff00d62a282278fb8719f4fab3a586a0a2c0fffbea::coin::T, 0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDC, 0x190d44266241744264b964a37b8f09863167a12d3e70cda39376cfb4e3561e12::curves::Uncorrelated>>"
    );
    const balance = resource.data.coin.value;
    return balance;
  } catch (error) {
    console.error("Error getting LP token balance:", error);
    throw error;
  }
}

// Example usage for adding, removing liquidity, and swapping tokens
const fromToken = "0x1::aptos_coin::AptosCoin"; // Aptos Coin (APT)
const toToken =
  "0x5e156f1207d0ebfa19a9eeff00d62a282278fb8719f4fab3a586a0a2c0fffbea::coin::T"; // USD Coin (USDC)
const amount = 1; // 1 APT (adjust based on token decimals)
const eventType = "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>";
const toliquidity =
  "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDC";
const privateKeyHex =
  "0xd5423b37690275edcd4c726943cfc405e5fb089f398166d4951d6b41d36028c3";
const privateKeyUint8Array = hexToUint8Array(privateKeyHex);
const account = new AptosAccount(privateKeyUint8Array);
// Function to listen for swap events by creation number
async function listenForSwapEvents(
  address,
  creationNumber,
  limit = 10,
  start = 0
) {
  const url = `https://fullnode.mainnet.aptoslabs.com/v1/accounts/${address}/events/${creationNumber}?limit=${limit}&start=${start}`;
  try {
    const response = await fetch(url);
    const events = await response.json();

    if (!Array.isArray(events)) {
      throw new Error("Unexpected response format");
    }
    events.forEach((event) => {
      const swapDetails = extractSwapDetails(event);
      console.log("Swap Details:", swapDetails);
    });
  } catch (error) {
    console.error("Error fetching events:", error);
  }
}

// Function to extract swap details from event data
function extractSwapDetails(event) {
  const {
    version,
    sequence_number,
    type,
    data: { coin_in, coin_out, amount_in, amount_out, sender },
  } = event;

  return {
    transaction_version: version,
    sequence_number,
    type,
    coin_in,
    coin_out,
    amount_in,
    amount_out,
    sender,
  };
}
const main = async () => {
  try {
    const gasestimation = client.estimateGasPrice().then((gasPrice) => {
      console.log("Gas Price before initialisation:", gasPrice);
    });

    // Register the account for Aptos Coin (APT) and USDC
    const aptosCoinType = "0x1::aptos_coin::AptosCoin";
    await registerCoin(account, aptosCoinType);

    const usdcCoinType =
      "0x5e156f1207d0ebfa19a9eeff00d62a282278fb8719f4fab3a586a0a2c0fffbea::coin::T";
    await registerCoin(account, usdcCoinType);
    // Get LP token balance before liquidity operations
    const lpTokenBalanceBefore = await getLPTokenBalance(account);
    console.log(`LP Token Balance Before liquidity: ${lpTokenBalanceBefore}`);

    // Add liquidity
    const addLiquidityResult = await addLiquidity(
      toToken,
      toliquidity,
      amount * Math.pow(10, 8),
      amount * Math.pow(10, 6),
      account
    );
    console.log(`Liquidity added: ${JSON.stringify(addLiquidityResult)}`);

    // Get pool reserves to calculate minAmountsOut for removing liquidity
    const { x_reserve, y_reserve } = await getPoolReserves(
      toToken,
      toliquidity
    );

    // Get LP token balance after adding liquidity
    const lpTokenBalanceAfter = await getLPTokenBalance(account);
    console.log(`LP Token Balance After liquidity: ${lpTokenBalanceAfter}`);
    // Calculate minAmountsOut based on reserves and slippage
    const slippage = 0.005;
    const burnAmount = amount * Math.pow(10, 8);
    const minAmountsOut = [
      Math.floor(x_reserve * (1 - slippage)),
      Math.floor(y_reserve * (1 - slippage)),
    ];

    // Remove liquidity
    const removeLiquidityResult = await removeLiquidity(
      toToken,
      toliquidity,
      burnAmount,
      minAmountsOut,
      account
    );
    console.log(`Liquidity removed: ${JSON.stringify(removeLiquidityResult)}`);

    // Swap tokens
    const swapResult = await swapTokens(fromToken, toToken, amount, account);
    console.log(`Swap successful: ${JSON.stringify(swapResult)}`);

    // Get and analyze the transaction details
    const txnDetails = await getTransactionDetails(swapResult.hash);
    console.log("Transaction details:", txnDetails);
    const swapEvent = txnDetails.events[2].guid.account_address;
    console.log("Swap Pool Address:", swapEvent);
    const isSwap = txnDetails.payload.function.includes("swap");
    const hops = txnDetails.payload.arguments.length - 2;
    const dex = "Pontem";
    const startToken = txnDetails.payload.arguments[0];
    const endToken = txnDetails.payload.arguments[1];
    const startAmount = txnDetails.payload.arguments[2];
    const endAmount = txnDetails.payload.arguments[3];
    const performerAddress = txnDetails.sender;

    console.log(`Is Swap: ${isSwap}`);
    console.log(`Number of Hops: ${hops}`);
    console.log(`DEX: ${dex}`);
    console.log(`Start Token: ${startToken}`);
    console.log(`End Token: ${endToken}`);
    console.log(`Start Amount: ${startAmount}`);
    console.log(`End Amount: ${endAmount}`);
    console.log(`Performer Address: ${performerAddress}`);
    const address = account.address();
    const { depositEvent, withdrawEvent } = await getCreationNumberForEventType(
      address,
      eventType
    );

    // Listen for swap events using the dynamic creation number
    listenForSwapEvents(address, depositEvent);
    listenForSwapEvents(address, withdrawEvent);
  } catch (error) {
    console.error("Error:", error);
  }
};

main();
