const eventBus = require('../../../shared/events/event.bus');
const InventoryService = require('../services/inventory.service');

// Listen for order cancellations to restore inventory
eventBus.on('ORDER_CANCELLED', async (data) => {
    console.log(`[Inventory] Restoring stock for cancelled order ${data.orderId}`);
    await InventoryService.releaseStock(data.items);
});
