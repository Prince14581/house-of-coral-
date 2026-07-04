const OrderRepository = require('../repositories/order.repository');
const OrderCoreService = require('../../../core/commerce/services/order.core.service');
const InventoryService = require('./inventory.service');
const eventBus = require('../../../shared/events/event.bus');

class OrderService {
    static async placeOrder(userId, cartItems) {
        // 1. Inventory Reservation
        await InventoryService.reserveStock(cartItems);

        // 2. Creation
        const order = await OrderRepository.create({ userId, items: cartItems, status: 'PENDING' });

        // 3. Emit Domain Event
        eventBus.publish('ORDER_CREATED', { orderId: order._id, userId, items: cartItems });
        
        return order;
    }

    static async updateStatus(orderId, newStatus) {
        const order = await OrderRepository.findById(orderId);
        
        // Use Core Engine to validate lifecycle
        if (!OrderCoreService.validateOrderState(order.status, newStatus)) {
            throw new Error("Invalid order state transition");
        }

        const updated = await OrderRepository.updateStatus(orderId, newStatus);
        eventBus.publish('ORDER_STATUS_UPDATED', { orderId, status: newStatus });
        return updated;
    }
}
module.exports = OrderService;
