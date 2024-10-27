const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Muestra todos los comandos disponibles y sus descripciones'),
    
  async execute(interaction) {
    const commandFolder = path.join(__dirname, '../'); // Ruta a la carpeta de comandos
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
      .setThumbnail('https://th.bing.com/th/id/OIP.ISvXmPADhupeMOh9KYnBCAAAAA?rs=1&pid=ImgDetMain')
      .setTimestamp()
      .setFooter({ text: '¡Utiliza estos comandos para interactuar con el bot!', iconURL: 'https://www.bing.com/images/search?view=detailV2&ccid=qraT6QWY&id=08153FAAEE7098C651BD443BF455DCA19639460C&thid=OIP.qraT6QWYRWX5Jwuqmk9N5QAAAA&mediaurl=https%3A%2F%2Fcmm.world%2Fwp-content%2Fuploads%2F2016%2F04%2Fhelp.jpg&exph=400&expw=400&q=help+pixel+art+background&simid=608018364656073854&form=IRPRST&ck=BAD7511732F5EED502F128FA3A970ED7&selectedindex=3&itb=0&ajaxhist=0&ajaxserp=0&cit=ccid_ISvXmPAD*cp_5E2B7A40E386DD1BE250B3CB92076811*mid_4A4CD76CBC8ABDA1D3A62FD19C1B0741430588AD*simid_608024111361979112*thid_OIP.ISvXmPADhupeMOh9KYnBCAAAAA&cdnurl=https%3A%2F%2Fth.bing.com%2Fth%2Fid%2FR.aab693e905984565f9270baa9a4f4de5%3Frik%3DDEY5lqHcVfQ7RA%26pid%3DImgRaw%26r%3D0&vt=2' });

    // Añadir campos por cada categoría de comandos
    for (const [category, commands] of Object.entries(categories)) {
      const commandList = commands.map(cmd => `\`${cmd.name}\`: ${cmd.description}`).join('\n');
      helpEmbed.addFields({ name: `🔧 Categoría: ${category}`, value: commandList || 'No hay comandos en esta categoría.', inline: false });
    }

    // Responder de manera efímera (solo visible para el usuario que ejecutó el comando)
    await interaction.reply({ embeds: [helpEmbed], ephemeral: true });
  },
};
