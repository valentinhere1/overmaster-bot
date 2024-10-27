const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField, ComponentType } = require('discord.js');

module.exports = {
    data: {
        name: 'anuncio',
        description: 'Crea un anuncio interactivo en el canal.',
    },
    async execute(message) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('Permiso denegado')
                .setDescription('❌ No tienes permisos para usar este comando.');

            return message.reply({ embeds: [errorEmbed], ephemeral: true });
        }

        try {
            let title = '';
            let body = '';
            let color = '#00bfff';
            let imageUrl = '';
            let selectedChannel = null;

            let announcementEmbed = new EmbedBuilder()
                .setColor(color)
                .setFooter({ text: `Anunciado por ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
                .setTimestamp();

            // Definir los colores en diferentes páginas
            const colorPages = [
                [
                    { name: 'Rojo', value: '#ff0000' },
                    { name: 'Verde', value: '#00ff00' },
                    { name: 'Azul', value: '#0000ff' },
                    { name: 'Amarillo', value: '#ffff00' },
                ],
                [
                    { name: 'Negro', value: '#000000' },
                    { name: 'Naranja', value: '#ffa500' },
                    { name: 'Morado', value: '#800080' },
                    { name: 'Rosa', value: '#ff69b4' },
                ],
                [
                    { name: 'Cian', value: '#00ffff' },
                    { name: 'Dorado', value: '#ffd700' },
                    { name: 'Plateado', value: '#c0c0c0' },
                    { name: 'Blanco', value: '#ffffff' },
                ],
            ];

            let currentPage = 0; // Página actual de colores

            // Función para generar los botones de colores y navegación
            const getColorButtons = (page) => {
                const colorButtons = new ActionRowBuilder();
                colorPages[page].forEach((colorOption) => {
                    colorButtons.addComponents(
                        new ButtonBuilder().setCustomId(`color_${colorOption.value}`).setLabel(colorOption.name).setStyle(ButtonStyle.Primary)
                    );
                });

                // Botones de navegación
                const navigationButtons = new ActionRowBuilder();
                if (page > 0) {
                    navigationButtons.addComponents(
                        new ButtonBuilder().setCustomId('prev_page').setLabel('Anterior').setStyle(ButtonStyle.Secondary)
                    );
                }
                if (page < colorPages.length - 1) {
                    navigationButtons.addComponents(
                        new ButtonBuilder().setCustomId('next_page').setLabel('Siguiente').setStyle(ButtonStyle.Secondary)
                    );
                }

                return [colorButtons, navigationButtons];
            };

            // Botones para editar
            const editButtons = (enabled) => new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('edit_title').setLabel('Editar Título').setStyle(enabled.title ? ButtonStyle.Success : ButtonStyle.Danger).setDisabled(!enabled.title),
                new ButtonBuilder().setCustomId('edit_description').setLabel('Editar Descripción').setStyle(enabled.description ? ButtonStyle.Success : ButtonStyle.Danger).setDisabled(!enabled.description),
                new ButtonBuilder().setCustomId('edit_color').setLabel('Editar Color').setStyle(enabled.color ? ButtonStyle.Success : ButtonStyle.Danger).setDisabled(!enabled.color),
                new ButtonBuilder().setCustomId('edit_channel').setLabel('Editar Canal').setStyle(enabled.channel ? ButtonStyle.Success : ButtonStyle.Danger).setDisabled(!enabled.channel),
                new ButtonBuilder().setCustomId('edit_image').setLabel('Editar Imagen').setStyle(enabled.image ? ButtonStyle.Success : ButtonStyle.Danger).setDisabled(!enabled.image)
            );

            // Función para actualizar el embed de vista previa
            const updatePreview = async (step, description, showColorButtons = false, enabled = { title: false, description: false, color: false, channel: false, image: false }) => {
                const previewEmbed = new EmbedBuilder()
                    .setColor('#00ff00')
                    .setTitle('Configuración del Anuncio')
                    .setDescription(description)
                    .setFooter({ text: `Paso ${step} de 5`, iconURL: message.author.displayAvatarURL() });

                announcementEmbed
                    .setTitle(title || 'Sin título')
                    .setDescription(body || 'Sin descripción')
                    .setColor(color);
                if (imageUrl) announcementEmbed.setImage(imageUrl);

                await interactiveMessage.edit({
                    embeds: [previewEmbed, announcementEmbed],
                    components: showColorButtons ? [...getColorButtons(currentPage), editButtons(enabled)] : [editButtons(enabled)],
                });
            };

            let embedTitle = new EmbedBuilder()
                .setColor('#00bfff')
                .setTitle('📢 Anuncio')
                .setDescription('¿Qué título quieres para el anuncio?');

            // Envía el mensaje interactivo inicial
            let interactiveMessage = await message.channel.send({
                embeds: [embedTitle],
                components: [],
            });

            // Pregunta el título
            const askTitle = async () => {
                await interactiveMessage.edit({ embeds: [embedTitle], components: [] });
                const titleCollector = message.channel.createMessageCollector({
                    filter: (response) => response.author.id === message.author.id,
                    max: 1,
                    time: 60000,
                });

                titleCollector.on('collect', async (response) => {
                    title = response.content;
                    await response.delete();
                    await updatePreview(2, '¿Qué descripción quieres para el anuncio?', false, { title: true });
                    titleCollector.stop();
                    await askDescription();
                });
            };

            // Pregunta la descripción
            const askDescription = async () => {
                const bodyCollector = message.channel.createMessageCollector({
                    filter: (response) => response.author.id === message.author.id,
                    max: 1,
                    time: 60000,
                });

                bodyCollector.on('collect', async (response) => {
                    body = response.content;
                    await response.delete();
                    await updatePreview(3, 'Selecciona el color del anuncio:', true, { title: true, description: true });
                    bodyCollector.stop();
                    await askColor();
                });
            };

            // Pregunta el color (con paginación)
            const askColor = async () => {
                const colorCollector = interactiveMessage.createMessageComponentCollector({
                    componentType: ComponentType.Button,
                    time: 60000,
                });

                colorCollector.on('collect', async (interaction) => {
                    if (interaction.customId === 'next_page') {
                        currentPage++;
                        await updatePreview(3, 'Selecciona el color del anuncio:', true, { title: true, description: true });
                    } else if (interaction.customId === 'prev_page') {
                        currentPage--;
                        await updatePreview(3, 'Selecciona el color del anuncio:', true, { title: true, description: true });
                    } else if (interaction.customId.startsWith('color_')) {
                        color = interaction.customId.split('_')[1];
                        await interaction.deferUpdate();
                        await updatePreview(4, '¿A qué canal quieres enviar el anuncio? Menciona un canal (#nombre).', false, { title: true, description: true, color: true });
                        await askChannel();
                    }
                });
            };

            // Pregunta el canal
            const askChannel = async () => {
                const channelCollector = message.channel.createMessageCollector({
                    filter: (response) => response.author.id === message.author.id,
                    max: 1,
                    time: 60000,
                });

                channelCollector.on('collect', async (response) => {
                    const mentionedChannel = response.mentions.channels.first();
                    if (mentionedChannel) {
                        selectedChannel = mentionedChannel;
                        await response.delete();
                        await updatePreview(5, '¿Quieres añadir una imagen? Proporciona un enlace o sube una imagen.', false, { title: true, description: true, color: true, channel: true });
                        channelCollector.stop();
                        await askImage();
                    } else {
                        await message.channel.send('❌ No has mencionado un canal válido. Intenta de nuevo mencionando un canal.');
                    }
                });
            };

            // Pregunta la imagen
            const askImage = async () => {
                const imageCollector = message.channel.createMessageCollector({
                    filter: (response) => response.author.id === message.author.id,
                    max: 1,
                    time: 60000,
                });

                imageCollector.on('collect', async (response) => {
                    if (response.attachments.size > 0) {
                        imageUrl = response.attachments.first().url;
                    } else {
                        imageUrl = response.content;
                    }
                    await response.delete();
                    await askAnotherEmbed();
                });
            };

            // Pregunta si quiere añadir otro embed
            const askAnotherEmbed = async () => {
                const anotherEmbedCollector = message.channel.createMessageCollector({
                    filter: (response) => response.author.id === message.author.id,
                    max: 1,
                    time: 60000,
                });

                anotherEmbedCollector.on('collect', async (response) => {
                    const reply = response.content.toLowerCase();
                    if (reply === 'si') {
                        await updatePreview('extra', 'Añade la descripción del nuevo embed.');
                        await askDescription(); // Reutiliza la función de descripción para otro embed
                    } else {
                        await addConfirmationButtons();
                    }
                });
            };

            // Pregunta si quiere confirmar o cancelar
            const addConfirmationButtons = async () => {
                const confirmButton = new ButtonBuilder()
                    .setCustomId('confirm')
                    .setLabel('Confirmar')
                    .setStyle(ButtonStyle.Success);

                const cancelButton = new ButtonBuilder()
                    .setCustomId('cancel')
                    .setLabel('Cancelar')
                    .setStyle(ButtonStyle.Danger);

                const confirmationRow = new ActionRowBuilder().addComponents(confirmButton, cancelButton);

                await interactiveMessage.edit({
                    components: [confirmationRow],
                });

                const confirmationCollector = interactiveMessage.createMessageComponentCollector({
                    componentType: ComponentType.Button,
                    max: 1,
                    time: 60000,
                });

                confirmationCollector.on('collect', async (interaction) => {
                    await interaction.deferUpdate();
                    if (interaction.customId === 'confirm') {
                        await selectedChannel.send({ embeds: [announcementEmbed] });
                        await message.channel.send('✅ El anuncio ha sido enviado correctamente.');
                    } else if (interaction.customId === 'cancel') {
                        await message.channel.send('❌ El anuncio ha sido cancelado.');
                    }
                });
            };

            // Inicia el flujo de preguntas
            await askTitle();
        } catch (error) {
            console.error('Error en el comando de anuncio:', error);
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('Error')
                .setDescription('❌ Ocurrió un error al crear el anuncio. Por favor, intenta nuevamente.');
            return message.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    },
};
