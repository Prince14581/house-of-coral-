const Event = require('../models/Event');
const { processEscrow } = require('../services/transactionDispatcher');

exports.buyTicket = async (req, res) => {
    try {
        const { eventId, buyerId } = req.body;
        const event = await Event.findById(eventId);

        if (!event || event.ticketsSold >= event.totalTickets) {
            return res.status(400).json({ message: "Tickets sold out or event not found." });
        }

        // Process the payment through the Escrow Engine
        await processEscrow({
            senderId: buyerId,
            receiverId: event.organizerId,
            amount: parseFloat(event.pricePerTicket),
            pillarType: 'JUBILEE',
            activityId: eventId
        });

        event.ticketsSold += 1;
        await event.save();

        res.status(200).json({ message: "Ticket purchased successfully." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
