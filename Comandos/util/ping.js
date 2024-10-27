const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: {
        name: 'ping', // Nombre del comando
        description: 'Este comando permite a los usuarios verificar la latencia de conexión.',
    },
    async execute(message) {
         // Elimina el mensaje del comando
    await message.delete();
        try {
            const botPing = message.client.ws.ping; // Obtener el ping del bot

            // Crear el embed con diseño mejorado
            const embed = new EmbedBuilder()
                .setColor(0x00ff00) // Color verde
                .setTitle('📶 Estado de Conexión')
                .setDescription(`La conexion actual es de **${botPing} ms**.`)
                .setThumbnail('https://media.forgecdn.net/avatars/199/710/636908708078098459.png') // Puedes agregar una imagen aquí si lo deseas
                .addFields(
                    { name: '💻 WebSocket Ping', value: `\`${botPing} ms\``, inline: true },
                    { name: 'Estado del Bot', value: botPing < 100 ? '🟢 Excelente' : '🟡 Aceptable', inline: true }
                )
                .setFooter({ text: 'OverMaster MC - Latencia de conexión', iconURL: 'https://media.forgecdn.net/avatars/199/710/636908708078098459.png' }) // Cambia este icono si lo deseas
                .setTimestamp();

            // Responder al usuario con el embed
            const sentMessage = await message.channel.send({ embeds: [embed] });

            // Eliminar el mensaje después de 5 segundos
            setTimeout(async () => {
                try {
                    await sentMessage.delete();
                } catch (error) {
                    console.error('Error al eliminar el mensaje:', error);
                }
            }, 15000); // Eliminar después de 

        } catch (error) {
            console.error('Error al ejecutar el comando ping:', error);
            // Si ocurre un error, enviar un mensaje de error al usuario
            await message.channel.send('❌ Hubo un error al ejecutar este comando. Inténtalo nuevamente más tarde.');
        }
    },
    
};