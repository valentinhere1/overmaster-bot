const { EmbedBuilder } = require('discord.js');

module.exports = {
  data: {
    name: 'warn',
  },
  async execute(message, args) {
    try {
      // Verificar que el autor tenga permisos para advertir
      if (!message.member.permissions.has('KICK_MEMBERS')) {
        if (!message._replySent) {
          message._replySent = true; // Evitar duplicados
          return message.reply('No tienes permisos para advertir a los usuarios.');
        }
      }

      // Obtener el miembro mencionado
      const target = message.mentions.members.first();
      if (!target) {
        if (!message._replySent) {
          message._replySent = true; // Evitar duplicados
          return message.reply('Debes mencionar a un usuario para advertir.');
        }
      }

      // Crear un embed para la advertencia
      const warnEmbed = new EmbedBuilder()
        .setColor(0xffcc00) // Color amarillo
        .setTitle('Advertencia')
        .setDescription(`${target} ha sido advertido por ${message.author}.`)
        .setTimestamp();

      // Obtener el canal por ID y enviar el mensaje ahí
      const warningChannel = message.guild.channels.cache.get('1289599659928584232');
      if (!warningChannel) {
        if (!message._replySent) {
          message._replySent = true; // Evitar duplicados
          return message.reply('No se pudo encontrar el canal para enviar la advertencia.');
        }
      }

      // Enviar la advertencia al canal específico
      if (!message._replySent) {
        message._replySent = true; // Evitar duplicados
        await warningChannel.send({ embeds: [warnEmbed] });
      }

    } catch (error) {
      console.error('Ocurrió un error al ejecutar el comando de advertencia:', error);
      if (!message._replySent) {
        message._replySent = true; // Evitar duplicados
        message.reply('Ocurrió un error al procesar la advertencia.');
      }
    }
  },
};