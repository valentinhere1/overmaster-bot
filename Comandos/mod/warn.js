const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');

module.exports = {
    data: {
        name: 'warn',
        description: 'Advierte a un usuario con mal comportamiento.',
    },
    async execute(message, args) {
        // Elimina el mensaje del comando
        await message.delete();
        try {
            // Verificar que el autor tenga permisos para advertir
            if (!message.member.permissions.has('KICK_MEMBERS')) {
                const noPermsEmbed = new EmbedBuilder()
                    .setColor(0xff0000)
                    .setTitle('❌ Error')
                    .setDescription('No tienes permisos para advertir a los usuarios.')
                    .setTimestamp();
                return message.channel.send({ embeds: [noPermsEmbed] });
            }

            // Obtener el miembro mencionado
            const target = message.mentions.members.first();
            if (!target) {
                const noUserEmbed = new EmbedBuilder()
                    .setColor(0xff0000)
                    .setTitle('❌ Error')
                    .setDescription('Debes mencionar a un usuario para advertir.')
                    .setTimestamp();
                return message.channel.send({ embeds: [noUserEmbed] });
            }

            // Verificar o crear roles de advertencia
            const guild = message.guild;
            let warnLevel1 = guild.roles.cache.find(role => role.name === 'Advertencia Nivel 1');
            let warnLevel2 = guild.roles.cache.find(role => role.name === 'Advertencia Nivel 2');
            let warnLevel3 = guild.roles.cache.find(role => role.name === 'Advertencia Nivel 3');
            let muteRole = guild.roles.cache.find(role => role.name === 'Muteado');

            if (!warnLevel1) {
                warnLevel1 = await guild.roles.create({ name: 'Advertencia Nivel 1', color: '#FFFF00', reason: 'Rol de Advertencia Nivel 1' });
            }
            if (!warnLevel2) {
                warnLevel2 = await guild.roles.create({ name: 'Advertencia Nivel 2', color: '#FFA500', reason: 'Rol de Advertencia Nivel 2' });
            }
            if (!warnLevel3) {
                warnLevel3 = await guild.roles.create({ name: 'Advertencia Nivel 3', color: '#FF0000', reason: 'Rol de Advertencia Nivel 3' });
            }
            if (!muteRole) {
                muteRole = await guild.roles.create({ name: 'Muteado', color: '#808080', reason: 'Rol de Muteado' });
            }

            // Preguntar al moderador el nivel de advertencia
            const warnLevelRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('warn_level_1')
                    .setLabel('Nivel 1')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('warn_level_2')
                    .setLabel('Nivel 2')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('warn_level_3')
                    .setLabel('Nivel 3')
                    .setStyle(ButtonStyle.Primary)
            );

            const warnLevelMessage = await message.channel.send({
                content: `¿Qué nivel de advertencia deseas aplicar a ${target}?`,
                components: [warnLevelRow],
            });

            const levelFilter = i => ['warn_level_1', 'warn_level_2', 'warn_level_3'].includes(i.customId) && i.user.id === message.author.id;
            const levelCollector = warnLevelMessage.createMessageComponentCollector({ filter: levelFilter, componentType: ComponentType.Button, time: 60000 });

            levelCollector.on('collect', async interaction => {
                await interaction.deferUpdate();
                let selectedWarnLevel;
                let warnRole;
                let duration;

                if (interaction.customId === 'warn_level_1') {
                    selectedWarnLevel = 1;
                    warnRole = warnLevel1;
                    duration = 7 * 24 * 60 * 60 * 1000; // 1 semana
                } else if (interaction.customId === 'warn_level_2') {
                    selectedWarnLevel = 2;
                    warnRole = warnLevel2;
                    duration = 14 * 24 * 60 * 60 * 1000; // 2 semanas
                } else if (interaction.customId === 'warn_level_3') {
                    selectedWarnLevel = 3;
                    warnRole = warnLevel3;
                    duration = 21 * 24 * 60 * 60 * 1000; // 3 semanas
                }

                // Crear un embed informativo
                const warnEmbed = new EmbedBuilder()
                    .setColor(0xffcc00)
                    .setTitle('⚠️ Advertencia')
                    .setDescription(`${target} ha sido advertido.`)
                    .addFields(
                        { name: 'Moderador', value: `${message.author}`, inline: true },
                        { name: 'Nivel de Advertencia', value: `Nivel ${selectedWarnLevel}`, inline: true },
                        { name: 'Duración', value: `Esta advertencia durará ${selectedWarnLevel} semana(s).`, inline: true },
                        { name: 'Información', value: 'Si crees que esta advertencia no es válida, habla con un moderador para apelar su advertencia. El rol será retirado automáticamente luego de una(s) semana(s) despues.' },
                    )
                    .setFooter({ text: 'Sistema de Moderación' })
                    .setTimestamp();

                // Crear botones de confirmación
                const confirmRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('confirm_warn')
                        .setLabel('Confirmar Advertencia')
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId('cancel_warn')
                        .setLabel('Cancelar')
                        .setStyle(ButtonStyle.Danger)
                );

                // Editar el mensaje anterior para agregar la confirmación
                await warnLevelMessage.edit({
                    content: `Has seleccionado la advertencia nivel ${selectedWarnLevel}. ¿Deseas confirmar?`,
                    embeds: [warnEmbed],
                    components: [confirmRow],
                });

                const confirmFilter = i => ['confirm_warn', 'cancel_warn'].includes(i.customId) && i.user.id === message.author.id;
                const confirmCollector = warnLevelMessage.createMessageComponentCollector({ filter: confirmFilter, componentType: ComponentType.Button, time: 60000 });

                confirmCollector.on('collect', async confirmInteraction => {
                    await confirmInteraction.deferUpdate();

                    if (confirmInteraction.customId === 'confirm_warn') {
                        // Asignar el rol de advertencia
                        await target.roles.add(warnRole);

                        // Obtener el canal de reportes específico por ID
                        const reportChannel = message.guild.channels.cache.get('1286540093146005575');

                        if (!reportChannel) {
                            const noReportChannelEmbed = new EmbedBuilder()
                                .setColor(0xff0000)
                                .setTitle('❌ Error')
                                .setDescription('No se pudo encontrar el canal de reportes.')
                                .setTimestamp();
                            return message.channel.send({ embeds: [noReportChannelEmbed] });
                        }

                        // Enviar el reporte al canal específico
                        await reportChannel.send({ embeds: [warnEmbed] });

                        // Confirmación de envío
                        const successEmbed = new EmbedBuilder()
                            .setColor(0x00ff00)
                            .setTitle('✅ Advertencia Aplicada')
                            .setDescription(`${target} ha sido advertido con nivel ${selectedWarnLevel} y el reporte fue enviado al canal de reportes.`)
                            .setTimestamp();
                        await message.channel.send({ embeds: [successEmbed] });

                        // Programar para quitar el rol después de la duración específica
                        setTimeout(async () => {
                            await target.roles.remove(warnRole);

                            const removeWarnEmbed = new EmbedBuilder()
                                .setColor(0x00ff00)
                                .setTitle('⚠️ Rol de Advertencia Removido')
                                .setDescription(`El rol de advertencia de nivel ${selectedWarnLevel} ha sido removido a ${target}.`)
                                .setTimestamp();
                            await reportChannel.send({ embeds: [removeWarnEmbed] });

                            // Si es nivel 3, aplicar el mute por 3 horas
                            if (selectedWarnLevel === 3) {
                                await target.roles.add(muteRole);
                                const muteEmbed = new EmbedBuilder()
                                    .setColor(0xff0000)
                                    .setTitle('🔇 Usuario Silenciado')
                                    .setDescription(`${target} ha sido silenciado por 3 horas debido a la advertencia de nivel 3.`)
                                    .setTimestamp();
                                await reportChannel.send({ embeds: [muteEmbed] });

                                setTimeout(async () => {
                                    await target.roles.remove(muteRole);
                                    const unmuteEmbed = new EmbedBuilder()
                                        .setColor(0x00ff00)
                                        .setTitle('🔊 Usuario Desilenciado')
                                        .setDescription(`${target} ha sido desmuteado después de 3 horas.`)
                                        .setTimestamp();
                                    await reportChannel.send({ embeds: [unmuteEmbed] });
                                }, 3 * 60 * 60 * 1000); // 3 horas en milisegundos
                            }
                        }, duration); // Tiempo en milisegundos (según la duración seleccionada)

                    } else if (confirmInteraction.customId === 'cancel_warn') {
                        const cancelEmbed = new EmbedBuilder()
                            .setColor(0xffcc00)
                            .setTitle('❌ Advertencia Cancelada')
                            .setDescription('La advertencia ha sido cancelada.')
                            .setTimestamp();
                        await message.channel.send({ embeds: [cancelEmbed] });
                    }
                });
            });
        } catch (err) {
            console.error(err);
            const errorEmbed = new EmbedBuilder()
                .setColor(0xff0000)
                .setTitle('❌ Error')
                .setDescription('Ocurrió un error al intentar advertir al usuario. Por favor, inténtalo de nuevo.')
                .setTimestamp();
            return message.channel.send({ embeds: [errorEmbed] });
        }
    },
};
