// services/jubileeService.js
const JubileeEvent = require('../models/JubileeEvent');

exports.purchaseTicket = async (eventId, userId) => {
    // Atomic check: Ensure capacity exists and increment ticket count
    const event = await JubileeEvent.findOneAndUpdate(
        { _id: eventId, ticketsSold: { $lt: "$capacity" } },
        { $inc: { ticketsSold: 1 } },
        { new: true }
    );

    if (!event) throw new Error("Event sold out or unavailable.");
    return { eventId: event._id, confirmed: true };
};
