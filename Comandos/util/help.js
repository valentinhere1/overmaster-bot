const fs = require('fs');
const path = require('path');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  data: {
    name: 'help',
    description: 'Muestra todos los comandos disponibles y sus descripciones',
  },
  async execute(message, args) {
    const commandFolder = path.join(__dirname, '../'); // Ruta a la carpeta Comandos
    const categories = {};

    // Leer las subcarpetas dentro de 'Comandos'
    const commandFolders = fs.readdirSync(commandFolder, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory()) // Solo directorios
      .map(dirent => dirent.name);

    for (const folder of commandFolders) {
      const commandPath = path.join(commandFolder, folder);
      const commandFiles = fs.readdirSync(commandPath).filter(file => file.endsWith('.js'));

      categories[folder] = [];

      for (const file of commandFiles) {
        const command = require(path.join(commandPath, file));

        // Solo agregar el comando si tiene la estructura correcta
        if (command.data && command.data.name && command.data.description) {
          categories[folder].push({
            name: command.data.name,
            description: command.data.description,
          });
        }
      }
    }

    // Crear el embed para mostrar los comandos
    const helpEmbed = new EmbedBuilder()
      .setTitle('📜 Comandos Disponibles')
      .setDescription('Aquí están todos los comandos disponibles organizados por categoría:')
      .setColor('Random')
      .setThumbnail('https://example.com/tu-imagen.png') // Puedes agregar una imagen de miniatura aquí
      .setTimestamp()
      .setFooter({ text: '¡Utiliza estos comandos para interactuar con el bot!', iconURL: 'https://example.com/icono.png' }); // Cambia el icono a uno adecuado

    // Añadir campos por cada categoría de comandos
    for (const [category, commands] of Object.entries(categories)) {
      const commandList = commands.map(cmd => `\`${cmd.name}\`: ${cmd.description}`).join('\n');
      helpEmbed.addFields({ name: `🔧 Categoría: ${category}`, value: commandList || 'No hay comandos en esta categoría.', inline: false });
    }

    // Enviar el embed al canal
    try {
      await message.reply({ embeds: [helpEmbed] });
    } catch (error) {
      console.error('Error al enviar el mensaje de ayuda:', error);
      await message.reply('Hubo un error al intentar mostrar los comandos.');
    }
  },
};