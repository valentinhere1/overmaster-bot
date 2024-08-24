module.exports = {
    data: {
      name: 'clear',
      description: 'Elimina una cantidad específica de mensajes del canal actual.',
    },
    async execute(message, args) {
      // Verificar que el autor tenga permisos para gestionar mensajes
      if (!message.member.permissions.has('MANAGE_MESSAGES')) {
        return message.reply('No tienes permisos para eliminar mensajes.');
      }
  
      // Verificar que se haya proporcionado un número de mensajes a borrar
      const amount = parseInt(args[0]);
      if (isNaN(amount) || amount <= 0) {
        return message.reply('Debes proporcionar un número válido de mensajes a eliminar.');
      }
  
      // Limitar la cantidad de mensajes que se pueden borrar a la vez (máximo 100)
      if (amount > 100) {
        return message.reply('No puedes eliminar más de 100 mensajes a la vez.');
      }
  
      // Intentar eliminar la cantidad de mensajes especificada
      try {
        const deletedMessages = await message.channel.bulkDelete(amount, true); // Elimina mensajes que no sean mayores a 14 días
        const replyMessage = await message.channel.send(`✅ Se han eliminado ${deletedMessages.size} mensajes.`);
        
        // Eliminar el mensaje de confirmación después de unos segundos
        setTimeout(() => replyMessage.delete(), 5000); 
      } catch (error) {
        console.error('Error al intentar eliminar mensajes:', error);
        message.reply('Hubo un error al intentar eliminar los mensajes. Es posible que algunos mensajes sean muy antiguos.');
      }
    },
  };
  