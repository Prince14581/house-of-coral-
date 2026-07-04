// This service handles the UNIVERSAL order state lifecycle
class OrderCoreService {
    static validateOrderState(currentStatus, nextStatus) {
        const flow = {
            'PENDING': ['CONFIRMED', 'CANCELLED'],
            'CONFIRMED': ['SHIPPED', 'CANCELLED'],
            'SHIPPED': ['DELIVERED'],
            'DELIVERED': ['RETURN_REQUESTED'],
            'RETURN_REQUESTED': ['REFUNDED']
        };
        return flow[currentStatus]?.includes(nextStatus);
    }
}
module.exports = OrderCoreService;
