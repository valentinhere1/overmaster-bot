const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');

module.exports = {
  data: {
    name: 'aliado',
    description: 'Envía una solicitud de alianza.',
  },
  async execute(message) {
    // Elimina el mensaje del comando
    await message.delete();

    // Verifica que el autor tenga permisos para usar el comando
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.reply({ content: '🚫 No tienes permisos para usar este comando.', ephemeral: true });
    }

    // Pregunta el nombre del clan
    const clanNameEmbed = new EmbedBuilder()
      .setColor('#3498DB')
      .setTitle('📝 Solicitud de Alianza')
      .setDescription('¿Cuál es el nombre del clan que deseas postular para la alianza?');

    message.channel.send({ embeds: [clanNameEmbed] }).then(() => {
      const filter = response => response.author.id === message.author.id;
      const collector = message.channel.createMessageCollector({ filter, time: 60000, max: 1 });

      collector.on('collect', async (nameMessage) => {
        const clanName = nameMessage.content;
        await nameMessage.delete();

        // Pregunta el canal donde enviar la solicitud
        const channelEmbed = new EmbedBuilder()
          .setColor('#3498DB')
          .setTitle('📢 Canal de Alianza')
          .setDescription('Menciona el canal donde quieres enviar la solicitud de alianza (ej. #canal).');

        message.channel.send({ embeds: [channelEmbed] }).then(() => {
          const channelFilter = response => response.author.id === message.author.id;
          const channelCollector = message.channel.createMessageCollector({ filter: channelFilter, time: 60000, max: 1 });

          channelCollector.on('collect', async (channelMessage) => {
            const channelMention = channelMessage.mentions.channels.first();
            await channelMessage.delete();

            // Verifica si el canal existe
            if (!channelMention) {
              const errorEmbed = new EmbedBuilder()
                .setColor('#e74c3c')
                .setTitle('❌ Error')
                .setDescription('Debes mencionar un canal válido.');

              return message.channel.send({ embeds: [errorEmbed] });
            }

            // Pregunta el contenido de la solicitud
            const contentEmbed = new EmbedBuilder()
              .setColor('#3498DB')
              .setTitle('✉️ Contenido de la Solicitud')
              .setDescription('¿Qué mensaje quieres incluir en la solicitud de alianza?');

            message.channel.send({ embeds: [contentEmbed] }).then(() => {
              const bodyFilter = response => response.author.id === message.author.id;
              const bodyCollector = message.channel.createMessageCollector({ filter: bodyFilter, time: 60000, max: 1 });

              bodyCollector.on('collect', async (bodyMessage) => {
                const body = bodyMessage.content;
                await bodyMessage.delete();

                // Crear el embed de la solicitud de alianza
                const allianceEmbed = new EmbedBuilder()
                  .setColor('#3498DB') // Azul claro
                  .setTitle('📜 Solicitud de Alianza')
                  .setDescription(`El usuario **${message.author.username}** ha postulado al clan **${clanName}** para ser aliado del clan **OverMaster MC**.\n\n${body}`)
                  .addFields(
                    { name: 'Información:', value: 'La solicitud será revisada por un miembro administrativo del clan!' },
                    { name: 'Proceso de Aprobación:', value: 'La solicitud debe ser aprobada por los líderes del clan.' }
                  )
                  .setFooter({ text: `Solicitado por ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
                  .setTimestamp();

                // Crear botones de Aceptar y Rechazar
                const acceptButton = new ButtonBuilder()
                  .setCustomId('accept_alliance')
                  .setLabel('Aceptar')
                  .setStyle(ButtonStyle.Success);

                const rejectButton = new ButtonBuilder()
                  .setCustomId('reject_alliance')
                  .setLabel('Rechazar')
                  .setStyle(ButtonStyle.Danger);

                const actionRow = new ActionRowBuilder().addComponents(acceptButton, rejectButton);

                // Envía el embed con los botones
                const embedMessage = await channelMention.send({
                  content: 'Nueva solicitud de alianza, elige una opción:',
                  embeds: [allianceEmbed],
                  components: [actionRow],
                });

                // Espera la interacción con los botones
                const buttonFilter = i => (i.customId === 'accept_alliance' || i.customId === 'reject_alliance') && i.member.permissions.has(PermissionsBitField.Flags.Administrator);
                const buttonCollector = embedMessage.createMessageComponentCollector({ filter: buttonFilter, time: 60000 });

                buttonCollector.on('collect', async (interaction) => {
                  if (interaction.customId === 'accept_alliance') {
                    // Crea un embed de confirmación
                    const acceptedEmbed = new EmbedBuilder()
                      .setColor('#2ecc71') // Verde
                      .setTitle('Alianza Aceptada!')
                      .setDescription(`El clan **${clanName}** ha sido aceptado como aliado del clan **OverMaster**.`)
                      .addFields({ name: 'Verificado por:', value: `${interaction.user.tag}` })
                      .setFooter({ text: 'Alianza confirmada', iconURL: interaction.user.displayAvatarURL() })
                      .setTimestamp();

                    // Elimina el embed anterior y envía el nuevo
                    await embedMessage.delete();
                    await channelMention.send({ embeds: [acceptedEmbed] });
                  } else if (interaction.customId === 'reject_alliance') {
                    // Crea un embed de rechazo
                    const rejectedEmbed = new EmbedBuilder()
                      .setColor('#e74c3c') // Rojo
                      .setTitle('❌ Alianza Rechazada')
                      .setDescription(`La solicitud de alianza del clan **${clanName}** ha sido rechazada.`)
                      .addFields({ name: 'Rechazado por:', value: `${interaction.user.tag}` })
                      .setFooter({ text: 'Alianza rechazada', iconURL: interaction.user.displayAvatarURL() })
                      .setTimestamp();

                    // Elimina el embed anterior y envía el nuevo
                    await embedMessage.delete();
                    await channelMention.send({ embeds: [rejectedEmbed] });
                  }
                });

                buttonCollector.on('end', collected => {
                  if (collected.size === 0) {
                    const timeoutEmbed = new EmbedBuilder()
                      .setColor('#f39c12')
                      .setTitle('⏰ Solicitud Cancelada')
                      .setDescription('No se recibió ninguna respuesta. La solicitud ha sido cancelada.');

                    message.channel.send({ embeds: [timeoutEmbed] });
                  }
                });
              });
            });
          });
        });
      });
    });
  },
};