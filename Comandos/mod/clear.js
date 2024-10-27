const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: {
        name: 'clear',
        description: 'Elimina una cantidad específica de 100 mensajes del canal actual.',
    },
    async execute(message, args) {
        // Elimina el mensaje del comando
        await message.delete();

        // Verificar que el autor tenga permisos para gestionar mensajes
        if (!message.member.permissions.has('MANAGE_MESSAGES')) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('Permiso denegado')
                .setDescription('❌ No tienes permisos para eliminar mensajes.');
            return message.channel.send({ embeds: [errorEmbed] });
        }

        // Verificar que se haya proporcionado un número de mensajes a borrar
        const amount = parseInt(args[0]);
        if (isNaN(amount) || amount <= 0) {
            const invalidNumberEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('Número inválido')
                .setDescription('❌ Debes proporcionar un número válido de mensajes a eliminar.');
            return message.channel.send({ embeds: [invalidNumberEmbed] });
        }

        // Limitar la cantidad de mensajes que se pueden borrar a la vez (máximo 100)
        if (amount > 100) {
            const tooManyEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('Límite de mensajes')
                .setDescription('❌ No puedes eliminar más de 100 mensajes a la vez.');
            return message.channel.send({ embeds: [tooManyEmbed] });
        }

        // Intentar eliminar la cantidad de mensajes especificada
        try {
            const deletedMessages = await message.channel.bulkDelete(amount, true); // Elimina mensajes que no sean mayores a 14 días
            const successEmbed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('Mensajes eliminados')
                .setDescription(`✅ Se han eliminado ${deletedMessages.size} mensajes.`)
                .setFooter({ text: 'Solo se pueden eliminar mensajes que no excedan los 14 días.' });

            const replyMessage = await message.channel.send({ embeds: [successEmbed] });

            // Eliminar el mensaje de confirmación después de unos segundos
            setTimeout(() => replyMessage.delete(), 5000);
        } catch (error) {
            console.error('Error al intentar eliminar mensajes:', error);
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('Error')
                .setDescription('❌ Hubo un error al intentar eliminar los mensajes. Es posible que algunos mensajes sean muy antiguos.');
            message.channel.send({ embeds: [errorEmbed] });
        }
    },
};

  