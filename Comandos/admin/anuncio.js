const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('anuncio')
        .setDescription('Crea un anuncio interactivo en el canal.'),
    async execute(interaction) {
        // Pregunta el título del anuncio
        await interaction.reply({ content: '¿Qué título quieres para el anuncio?', ephemeral: true });

        const filter = (response) => response.author.id === interaction.user.id;

        // Espera la respuesta del usuario para el título
        const titleCollector = interaction.channel.createMessageCollector({ filter, time: 60000, max: 1 });

        titleCollector.on('collect', async (titleMessage) => {
            const title = titleMessage.content;
            await titleMessage.delete();

            // Pregunta el contenido del anuncio
            await interaction.followUp({ content: '¿Qué es lo que quieres decir en el anuncio?', ephemeral: true });

            const bodyCollector = interaction.channel.createMessageCollector({ filter, time: 60000, max: 1 });

            bodyCollector.on('collect', async (bodyMessage) => {
                const body = bodyMessage.content;
                await bodyMessage.delete();

                // Crear embed
                const announcementEmbed = new EmbedBuilder()
                    .setColor('#00ff99') // Color verde menta
                    .setTitle(`📢 ${title}`) // Título del anuncio
                    .setDescription(body) // Cuerpo del anuncio
                    .setFooter({ text: `Anunciado por ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() }) // Footer con el usuario
                    .setTimestamp(); // Marca de tiempo actual

                // Enviar el embed en el canal donde se ejecutó el comando
                await interaction.channel.send({ embeds: [announcementEmbed] });

                await interaction.followUp({ content: 'Anuncio enviado exitosamente.', ephemeral: true });
            });
        });
    },
};