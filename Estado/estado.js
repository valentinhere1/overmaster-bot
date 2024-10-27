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
      { name: "OverMaster MC", type: ActivityType.Watching },
      { name: "Minecraft server", type: ActivityType.Playing },
      { name: "c!help", type: ActivityType.Watching },
      { name: "Maestro Fundador", type: ActivityType.Playing },
      { name: "reuniones todos los domingos", type: ActivityType.Watching },
      { name: "alzar banderas en nombre del Clan", type: ActivityType.Playing },
      { name: "el estado del servidor apagado", type: ActivityType.Watching },
      { name: "coordinar estrategias para el próximo recluta", type: ActivityType.Playing },
      { name: "la unión de los miembros", type: ActivityType.Listening }
    ];

    let presenceArray = ["online", "idle", "dnd"]; // Array de presencias

    setInterval(() => {
      const statusOption = Math.floor(Math.random() * statusArray.length);
      const presenceOption = Math.floor(Math.random() * presenceArray.length);
      
      client.user.setPresence({
        activities: [{ 
          name: statusArray[statusOption].name, 
          type: statusArray[statusOption].type 
        }],
        status: presenceArray[presenceOption], // Cambia entre "online", "idle", "dnd"
      });
      
      console.log(``);
    }, 25000); // Cambia el estado y la actividad cada 55 segundos
  },
};
