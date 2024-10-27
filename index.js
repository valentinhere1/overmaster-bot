const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Collection, EmbedBuilder } = require('discord.js'); // Asegúrate de importar EmbedBuilder
require('dotenv').config();

// Crear una nueva instancia del cliente de Discord
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
  ],
});

// Crear una colección para los comandos
client.commands = new Collection();

// Definir las carpetas 'Comandos' y 'Estado'
const commandFolder = path.join(__dirname, 'Comandos');
const estadoFolder = path.join(__dirname, 'Estado');

// Verificar si las carpetas 'Comandos' y 'Estado' existen
if (!fs.existsSync(commandFolder)) {
  console.error('La carpeta "Comandos" no existe. Asegúrate de que esté en la ruta correcta.');
  process.exit(1);
}
if (!fs.existsSync(estadoFolder)) {
  console.error('La carpeta "Estado" no existe. Asegúrate de que esté en la ruta correcta.');
  process.exit(1);
}

// Función para cargar comandos desde una carpeta específica
const loadCommandsFromFolder = (folderPath) => {
  const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));

  for (const file of commandFiles) {
    const command = require(path.join(folderPath, file));

    // Verificar que el comando tenga la propiedad "data.name" y "execute"
    if (!command.data || !command.data.name || !command.execute) {
      console.error(`El archivo ${file} no tiene una propiedad "data.name" o "execute". Saltando...`);
      continue;
    }

    // Añadir el comando a la colección
    client.commands.set(command.data.name, command);
    console.log(`Comando cargado: ${command.data.name}`);
  }
};

// Cargar comandos desde las subcarpetas en 'Comandos'
const commandFolders = fs.readdirSync(commandFolder, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name);

for (const folder of commandFolders) {
  const commandPath = path.join(commandFolder, folder);
  loadCommandsFromFolder(commandPath);
}

// Cargar el comando de la carpeta 'Estado'
loadCommandsFromFolder(estadoFolder);

// Listener de evento para que el bot esté listo
client.once('ready', () => {
  console.log(`» | Bot iniciado con éxito como ${client.user.tag}`);
  
  // Llamar a la función de estado aquí (si la tienes)
  const estadoCommand = require(path.join(estadoFolder, 'estado'));
  estadoCommand.execute(client);
});

// Listener de mensajes para comandos con el prefijo 'c!'
client.on('messageCreate', async (message) => {
  const prefix = 'c!';
  

  // Verificar que el mensaje comience con el prefijo y no sea de un bot
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  // Extraer el nombre del comando y los argumentos
  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  if (!commandName) {
    return message.reply('Debes escribir un comando después del prefijo c!.');
  }

  // Buscar el comando
  const command = client.commands.get(commandName);

  // Si el comando no existe, responder con un mensaje
  if (!command) {
    return message.reply(`Comando: \`${commandName}\` no encontrado en la base de datos. Usa \`c!help\` para ver los comandos disponibles.`);
  }

  // Ejecutar el comando si existe
  try {
    await command.execute(message, args);
    console.log(`Comando ${commandName} ejecutado correctamente.`);
  } catch (error) {
    console.error(`Error ejecutando el comando ${commandName}:`, error);
    message.reply('Hubo un error al ejecutar ese comando.');
  }
});

// Listener de interacción para comandos de tipo slash
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: 'Hubo un error al ejecutar ese comando.', ephemeral: true });
  }
});

// Loguear el bot en Discord
client.login(process.env.TOKEN)
  .then(() => {
    console.log('» | Bot conectado correctamente.');
  })
  .catch(error => {
    console.error('» | Error al iniciar sesión en Discord:', error);
  });
