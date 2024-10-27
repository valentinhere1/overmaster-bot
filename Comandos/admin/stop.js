const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: {
        name: 'stop',
        description: 'Apaga el bot.',
    },
    async execute(message, args) {
        // Verifica que el usuario tenga permisos de administrador
        if (!message.member.permissions.has('ADMINISTRATOR')) {
            return message.reply({ content: '❌ No tienes permisos para usar este comando.', ephemeral: true });
        }

        // Elimina el mensaje del comando
        await message.delete();

        // Crea un embed lindo para confirmar que el bot se está apagando
        const shutdownEmbed = new EmbedBuilder()
            .setColor('#ff0000') // Color rojo para indicar apagado
            .setTitle('⚠️ Bot Apagado')
            .setDescription('El bot ha sido apagado correctamente. Para encenderlo nuevamente debe ser manualmente.')
            .setFooter({ text: `Comando ejecutado por: ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
            .setTimestamp();

        // Envía el mensaje de confirmación
        await message.channel.send({ embeds: [shutdownEmbed] });

        // Apaga el bot
        process.exit(0);
    },
};