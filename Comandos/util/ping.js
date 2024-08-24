const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Este comando permite a los usuarios verificar la latencia de conexión.'),

    async execute(interaction) {
        try {
            const botPing = interaction.client.ws.ping; // Obtener el ping del bot

            // Crear el embed con diseño mejorado
            const embed = new EmbedBuilder()
                .setColor(0x00ff00) // Color verde
                .setTitle('📶 Estado de Conexión')
                .setDescription(`🏓 Pong! La latencia actual es de **${botPing} ms**.`)
                .setThumbnail('https://example.com/tu-imagen.png') // Puedes agregar una imagen aquí si lo deseas
                .addFields(
                    { name: '💻 WebSocket Ping', value: `\`${botPing} ms\``, inline: true },
                    { name: 'Estado del Bot', value: botPing < 100 ? '🟢 Excelente' : '🟡 Aceptable', inline: true }
                )
                .setFooter({ text: 'Mapuche Bot - Latencia de conexión', iconURL: 'https://example.com/icono.png' }) // Cambia este icono si lo deseas
                .setTimestamp();

            // Responder al usuario con el embed
            await interaction.reply({ embeds: [embed], ephemeral: true });

            // Eliminar el mensaje después de 5 segundos
            setTimeout(async () => {
                try {
                    await interaction.deleteReply();
                } catch (error) {
                    console.error('Error al eliminar la respuesta:', error);
                }
            }, 5000);

        } catch (error) {
            console.error('Error al ejecutar el comando ping:', error);

            // Si ocurre un error, responder con un mensaje de error al usuario
            await interaction.reply({ content: '❌ Hubo un error al ejecutar este comando. Inténtalo nuevamente más tarde.', ephemeral: true });
        }
    },
};
