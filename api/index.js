// @ts-check
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  getOrCreateAssociatedTokenAccount,
} from '@solana/spl-token';
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import bs58 from 'bs58';
import dotenv from 'dotenv';

dotenv.config();

const SEVEN_SEAS_PROGRAM = new PublicKey('2a4NcnkF5zf14JQXHAv39AsRf7jMFj13wKmTL6ZcDQNd');
const GOLD_TOKEN_MINT = new PublicKey('goLdQwNaZToyavwkbuPJzTt5XPNR3H7WQBGenWtzPH3');
const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
// @ts-ignore
const payer = Keypair.fromSecretKey(bs58.decode(process.env.PAYER));

/**
 * @param {VercelRequest} request
 * @param {VercelResponse} response
 */
async function handlePost(request, response) {
  const player = new PublicKey(request.body.account);
  console.log('player', player.toBase58());

  const [level] = PublicKey.findProgramAddressSync([Buffer.from('level')], SEVEN_SEAS_PROGRAM);

  const [chestVault] = PublicKey.findProgramAddressSync(
    [Buffer.from('chestVault')],
    SEVEN_SEAS_PROGRAM,
  );

  const [gameActions] = PublicKey.findProgramAddressSync(
    [Buffer.from('gameActions')],
    SEVEN_SEAS_PROGRAM,
  );

  let [tokenAccountOwnerPda] = await PublicKey.findProgramAddressSync(
    [Buffer.from('token_account_owner_pda', 'utf8')],
    SEVEN_SEAS_PROGRAM,
  );

  let [tokenVault] = await PublicKey.findProgramAddressSync(
    [Buffer.from('token_vault', 'utf8'), GOLD_TOKEN_MINT.toBuffer()],
    SEVEN_SEAS_PROGRAM,
  );

  const playerTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    GOLD_TOKEN_MINT,
    player,
  );

  const chutuluIX = new TransactionInstruction({
    programId: SEVEN_SEAS_PROGRAM,
    keys: [
      {
        pubkey: chestVault,
        isWritable: true,
        isSigner: false,
      },
      {
        pubkey: level,
        isWritable: true,
        isSigner: false,
      },
      {
        pubkey: gameActions,
        isWritable: true,
        isSigner: false,
      },
      {
        pubkey: player,
        isWritable: true,
        isSigner: true,
      },
      {
        pubkey: SystemProgram.programId,
        isWritable: false,
        isSigner: false,
      },
      {
        pubkey: player,
        isWritable: false,
        isSigner: false,
      },
      {
        pubkey: playerTokenAccount.address,
        isWritable: true,
        isSigner: false,
      },
      {
        pubkey: tokenVault,
        isWritable: true,
        isSigner: false,
      },
      {
        pubkey: tokenAccountOwnerPda,
        isWritable: true,
        isSigner: false,
      },
      {
        pubkey: GOLD_TOKEN_MINT,
        isWritable: false,
        isSigner: false,
      },
      {
        pubkey: TOKEN_PROGRAM_ID,
        isWritable: false,
        isSigner: false,
      },
      {
        pubkey: ASSOCIATED_TOKEN_PROGRAM_ID,
        isWritable: false,
        isSigner: false,
      },
    ],

    data: Buffer.from(new Uint8Array([84, 206, 8, 255, 98, 163, 218, 19, 1])),
  });

  let tx = new Transaction().add(chutuluIX);
  tx.recentBlockhash = (await connection.getRecentBlockhash()).blockhash;
  tx.feePayer = payer.publicKey;
  tx.partialSign(payer);

  tx = Transaction.from(
    tx.serialize({
      verifySignatures: false,
      requireAllSignatures: false,
    }),
  );

  const serializedTx = tx.serialize({
    verifySignatures: false,
    requireAllSignatures: false,
  });

  const base64 = serializedTx.toString('base64');

  return response.status(200).json({
    transaction: base64,
    message: 'Chutulu Fire!',
  });
}

/**
 * @param {VercelResponse} response
 */
function handleGet(response) {
  return response.status(200).json({
    label: 'Chutulu Fire!',
    icon: 'https://github.com/solana-developers/pirate-bootcamp/blob/main/assets/kraken-1.png?raw=true',
  });
}

/**
 * @typedef {import('@vercel/node').VercelResponse} VercelResponse
 * @typedef {import('@vercel/node').VercelRequest} VercelRequest
 *
 * @param {VercelRequest} request
 * @param {VercelResponse} response
 * @returns {Promise<VercelResponse>}
 * */
export default async function handler(request, response) {
  console.log('handling request', request.method);

  if (request.method === 'GET') {
    return handleGet(response);
  } else if (request.method === 'POST') {
    return await handlePost(request, response);
  } else {
    return response.status(405).json({ error: 'Method not allowed' });
  }
}
