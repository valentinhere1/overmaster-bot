const { ActivityType } = require("discord.js");

module.exports = {
  name: "ready",
  data: {
    name: "ready",
  },
  once: true,

  async execute(client) {
    console.log("» | Bot conectado a la base de datos y listo");

    let statusArray = [
      { name: "Mapuche Clan", type: ActivityType.Watching },
      { name: "Minecraft server", type: ActivityType.Playing },
      { name: "6b6t.org", type: ActivityType.Playing },
      { name: "black.holy.gg", type: ActivityType.Playing },
      { name: "c!help", type: ActivityType.Watching },
      { name: "MapuToki", type: ActivityType.Playing },
      { name: "reuniones todos los domingos", type: ActivityType.Watching },
    ];

    setInterval(() => {
      const option = Math.floor(Math.random() * statusArray.length);
      client.user.setPresence({
        activities: [{ name: statusArray[option].name, type: statusArray[option].type }],
        status: "dnd", // Establecer el estado como "No molestar"
      });
    }, 5000); // Cambia el estado cada 5 segundos
  },
};
