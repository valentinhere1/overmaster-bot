const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');

module.exports = {
    data: {
        name: 'report',
        description: 'Reporta a un usuario con una razón específica.',
    },
    async execute(message, args) {
        // Elimina el mensaje del comando si es posible
        await message.delete().catch(err => console.error('Error al eliminar el mensaje del comando:', err));

        const userToReport = args[0];
        if (!userToReport) {
            return message.reply({ content: '¡Debes proporcionar el nombre del usuario que deseas reportar!', ephemeral: true });
        }

        args.shift();
        const reason = args.join(' ') || 'Sin razón especificada.';

        const reportChannelId = '1284224008195276840'; // ID del canal de reportes
        const reportChannel = message.guild.channels.cache.get(reportChannelId);

        if (!reportChannel) {
            return message.reply({ content: '¡El canal de reportes no se encuentra disponible!', ephemeral: true });
        }

        const skinUrl = `https://visage.surgeplay.com/bust/${userToReport}`;

        const reportEmbed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('🚨 Reporte de Usuario 🚨')
            .addFields(
                { name: 'Usuario Reportado', value: `${userToReport}`, inline: true },
                { name: 'Reportado por', value: `${message.author.tag}`, inline: true },
                { name: 'Razón', value: `${reason}`, inline: true }
            )
            .setImage(skinUrl)
            .setTimestamp();

        const deleteButton = new ButtonBuilder()
            .setCustomId('delete_report')
            .setLabel('🗑️ Rechazar Reporte')
            .setStyle(ButtonStyle.Danger);

        const confirmButton = new ButtonBuilder()
            .setCustomId('confirm_report')
            .setLabel('✅ Confirmar Reporte')
            .setStyle(ButtonStyle.Success);

        const row = new ActionRowBuilder().addComponents(deleteButton, confirmButton);

        try {
            const reportMessage = await reportChannel.send({
                embeds: [reportEmbed],
                components: [row],
            });

            // Mensaje efímero confirmando que el reporte fue enviado exitosamente
            await message.author.send('✅ ¡Tu reporte ha sido enviado exitosamente!').catch(() => {
                return message.reply({ content: '✅ ¡Tu reporte ha sido enviado exitosamente!', ephemeral: true });
            });

            const filter = interaction => ['delete_report', 'confirm_report'].includes(interaction.customId) && interaction.user.id === message.author.id;

            const collector = reportMessage.createMessageComponentCollector({
                filter,
                time: 3600000 // 1 hora
            });

            collector.on('collect', async (interaction) => {
                if (interaction.customId === 'delete_report') {
                    if (interaction.member.permissions.has(PermissionsBitField.Flags.Administrator) || interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
                        await reportMessage.delete(); // Eliminar el mensaje original

                        await reportChannel.send({
                            content: `🗑️ El reporte hacia el usuario **${userToReport}** ha sido rechazado por ${interaction.user.tag}.`
                        });

                        await interaction.reply({ content: '🗑️ Has eliminado el reporte.', ephemeral: true });
                    } else {
                        await interaction.reply({ content: '🚫 No tienes permisos para eliminar este reporte.', ephemeral: true });
                    }
                } else if (interaction.customId === 'confirm_report') {
                    if (interaction.member.permissions.has(PermissionsBitField.Flags.Administrator) || interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
                        await reportMessage.delete(); // Eliminar el mensaje original

                        const confirmedEmbed = new EmbedBuilder()
                            .setColor('#00ff00')
                            .setTitle('✅ Reporte Confirmado')
                            .setDescription(`El reporte hacia el usuario **${userToReport}** ha sido confirmado por ${interaction.user.tag}.`)
                            .addFields({ name: 'Razón', value: `${reason}`, inline: true })
                            .setThumbnail(skinUrl)
                            .setTimestamp();

                        await reportChannel.send({
                            embeds: [confirmedEmbed]
                        });

                        await interaction.reply({ content: '✅ Has confirmado el reporte.', ephemeral: true });
                    } else {
                        await interaction.reply({ content: '🚫 No tienes permisos para confirmar este reporte.', ephemeral: true });
                    }
                }
            });

            collector.on('end', async (collected) => {
                if (collected.size === 0) {
                    try {
                        const autoConfirmedEmbed = new EmbedBuilder()
                            .setColor('#00ff00')
                            .setTitle('✅ Reporte Confirmado Automáticamente')
                            .setDescription(`El reporte al usuario **${userToReport}** ha sido confirmado automáticamente.`)
                            .addFields({ name: 'Razón', value: `${reason}`, inline: true })
                            .setThumbnail(skinUrl)
                            .setTimestamp();

                        await reportMessage.edit({
                            embeds: [autoConfirmedEmbed],
                            components: []
                        });
                    } catch (error) {
                        console.error('Error al editar el mensaje tras la expiración del colector:', error);
                    }
                }
            });
        } catch (error) {
            console.error('Error al enviar el reporte:', error);
            await message.reply({ content: 'Hubo un error al ejecutar ese comando.', ephemeral: true });
        }
    },
};
