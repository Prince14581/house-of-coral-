const Message = require('../models/message.model');
const { socialEvents } = require('./social.service');

class MessageService {
    static async send(senderId, recipientId, content) {
        const message = await Message.create({
            senderId,
            recipientId,
            content,
            status: 'sent'
        });

        // Fire event: Analytics or Notification engines will pick this up
        socialEvents.emit('MESSAGE_SENT', { senderId, recipientId, messageId: message._id });
        
        return message;
    }
}
