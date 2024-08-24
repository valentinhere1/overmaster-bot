const fetch = require('node-fetch');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  data: {
    name: 'report',
  },
  async execute(message, args) {
    // Verificar que se ha proporcionado un nombre de jugador
    if (args.length < 1) {
      const errorMsg = await message.reply('Debes proporcionar el nombre de usuario de Minecraft para reportar.');
      setTimeout(() => errorMsg.delete().catch(console.error), 10000); // Eliminar el mensaje de error después de 10 segundos
      return;
    }

    const playerName = args[0];
    const reason = args.slice(1).join(' ') || 'No se proporcionó una razón.';

    // URL para obtener la skin del jugador
    const skinUrl = `https://minotar.net/avatar/${playerName}`;

    try {
      // Realizar una petición a la API para verificar si la imagen del jugador existe
      const response = await fetch(skinUrl);

      if (!response.ok) {
        throw new Error('No se pudo obtener la skin del jugador.');
      }

      // Crear un embed para el reporte
      const reportEmbed = new EmbedBuilder()
        .setTitle('Reporte exitoso')
        .setDescription(`El usuario ${message.author.username} ha reportado al jugador **${playerName}**.\n**Razón:** ${reason}`)
        .setImage(skinUrl)  // Mostrar la imagen de la skin del jugador
        .setFooter({ text: 'Reporte enviado con éxito.' });

      // Borrar el mensaje del usuario y enviar el embed
      await message.delete();
      message.channel.send({ embeds: [reportEmbed] });

    } catch (error) {
      console.error('Error al procesar el reporte:', error);
      const errorMsg = await message.reply('Hubo un error al procesar el reporte. Por favor, intenta nuevamente.');
      setTimeout(() => errorMsg.delete().catch(console.error), 10000); // Eliminar el mensaje de error después de 10 segundos
    }
  },
};