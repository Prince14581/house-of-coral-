const Event = require('../models/Event');
const Ticket = require('../models/Ticket');
const AuditLog = require('../models/AuditLog');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

// Startup validation for platform configuration
const feePercent = Number(process.env.PLATFORM_FEE_PERCENT || 10);
if (feePercent < 0 || feePercent > 100) {
    throw new Error("Invalid PLATFORM_FEE_PERCENT: Must be between 0 and 100.");
}
const PLATFORM_FEE_PERCENT = feePercent;

/**
 * Atomic ticket booking: Lifecycle validated, idempotent, and ledger-ready.
 */
exports.bookTicket = async (req, res) => {
    const start = Date.now();
    const now = new Date();
    const { eventId } = req.body;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(eventId)) return res.status(400).json({ status: "error", message: "Invalid event ID." });

    const session = await mongoose.startSession();
    try {
        let ticket;
        await session.withTransaction(async () => {
            // 1. Atomic lifecycle & availability check
            const event = await Event.findOneAndUpdate(
                { 
                    _id: eventId, 
                    status: 'published', 
                    availableSeats: { $gt: 0 }, 
                    date: { $gt: now },
                    deletedAt: null 
                },
                { $inc: { availableSeats: -1 } },
                { new: true, session }
            );

            if (!event) throw new Error("UNBOOKABLE");

            // 2. Financial validation
            if (event.price < 0) throw new Error("INVALID_PRICE");
            const priceInCents = Math.round(event.price * 100);
            const feeInCents = Math.round(priceInCents * (PLATFORM_FEE_PERCENT / 100));

            // 3. Create immutable record with DB-enforced uniqueness
            try {
                [ticket] = await Ticket.create([{
                    ticketRef: `TKT-${uuidv4().split('-')[0].toUpperCase()}`,
                    eventId,
                    userId,
                    price: priceInCents,
                    fee: feeInCents,
                    status: 'confirmed',
                    createdAt: now
                }], { session });
            } catch (err) {
                if (err.code === 11000) throw new Error("ALREADY_BOOKED");
                throw err;
            }

            await AuditLog.create([{
                action: 'TICKET_BOOKED',
                actorId: userId,
                documentId: ticket._id,
                status: 'success',
                createdAt: now,
                metadata: { eventId, fee: feeInCents }
            }], { session });
        });

        res.status(201).json({ 
            status: "success", 
            data: ticket, 
            meta: { executionTimeMs: Date.now() - start, reportDate: now.toISOString() } 
        });
    } catch (error) {
        if (error.message === "UNBOOKABLE") return res.status(404).json({ status: "error", message: "Event not available." });
        if (error.message === "ALREADY_BOOKED") return res.status(409).json({ status: "error", message: "User already booked." });
        if (error.message === "INVALID_PRICE") return res.status(422).json({ status: "error", message: "Invalid event pricing." });
        
        console.error({ route: req.originalUrl, error: error.message });
        res.status(500).json({ status: "error", message: "Booking failed." });
    } finally {
        session.endSession();
    }
};

/**
 * Paginated event list with strict field projection.
 */
exports.getEvents = async (req, res) => {
    const start = Date.now();
    const now = new Date();
    try {
        const { startDate, endDate } = req.query;
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);

        const filter = { status: 'published', deletedAt: null, date: { $gt: now } };
        if (startDate) filter.date.$gte = new Date(startDate);
        if (endDate) filter.date.$lte = new Date(endDate);

        const [events, total] = await Promise.all([
            Event.find(filter)
                .select('title date venue price banner availableSeats')
                .sort({ date: 1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            Event.countDocuments(filter)
        ]);

        res.status(200).json({ 
            status: "success", 
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }, 
            data: events,
            meta: { executionTimeMs: Date.now() - start, reportDate: now.toISOString() } 
        });
    } catch (error) {
        console.error({ route: req.originalUrl, error: error.message });
        res.status(500).json({ status: "error", message: "Failed to retrieve events." });
    }
};
