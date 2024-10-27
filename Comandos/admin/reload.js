const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reload')
        .setDescription('Reinicia el bot.'),
    async execute(interaction) {
        // Verifica que el usuario que ejecuta el comando sea un administrador
        if (!interaction.member.permissions.has('ADMINISTRATOR')) {
            return interaction.reply({ content: 'No tienes permisos para usar este comando.', ephemeral: true });
        }

        await interaction.reply({ content: 'El bot fue reiniciado. debe prenderlo manualmente.', ephemeral: true });

        // Reiniciar el bot (esto depende de cómo inicias tu bot)
        // En este caso, terminamos el proceso y se debe reiniciar automáticamente por el proceso de supervisión
        process.exit(0); // Esto terminará el proceso del bot
    },
};
