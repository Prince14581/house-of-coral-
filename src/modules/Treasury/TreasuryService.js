const Ledger = require('./ledger/LedgerEntry');
const { v4: uuidv4 } = require('uuid');

class TreasuryService {
    /**
     * Executes a transaction and automatically routes the 10% fee to the Treasury Node.
     */
    static async processTransaction(senderId, receiverId, amount) {
        const fee = amount * 0.10;
        const netAmount = amount - fee;
        const txId = uuidv4();

        // Atomic Operation: Record Ledger Entries
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // 1. Log Platform Fee
            await Ledger.create([{
                txId: `${txId}-fee`, senderId, receiverId: 'TREASURY_NODE',
                amount: fee, type: 'PLATFORM_FEE'
            }], { session });

            // 2. Log Net Payment to Receiver
            await Ledger.create([{
                txId: `${txId}-payout`, senderId, receiverId,
                amount: netAmount, type: 'PAYOUT'
            }], { session });

            await session.commitTransaction();
            return { status: 'SUCCESS', txId, fee };
        } catch (error) {
            await session.abortTransaction();
            throw new Error('Ledger transaction failed: ' + error.message);
        }
    }
}

module.exports = TreasuryService;
