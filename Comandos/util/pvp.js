const { EmbedBuilder } = require('discord.js');

// Definimos los objetos de Minecraft y su daño o protección
const items = {
    weapons: [
        { name: 'Espada de Diamante', damage: 7 },
        { name: 'Espada de Hierro', damage: 6 },
        { name: 'Espada de Piedra', damage: 5 },
        { name: 'Espada de Madera', damage: 4 },
    ],
    armor: [
        { name: 'Armadura de Diamante', protection: 7 },
        { name: 'Armadura de Hierro', protection: 6 },
        { name: 'Armadura de Malla', protection: 5 },
        { name: 'Armadura de Cuero', protection: 3 },
    ],
    potions: [
        { name: 'Poción de Fuerza', effect: 5 }, // Añade daño extra
        { name: 'Poción de Regeneración', effect: 0 }, // No afecta el daño
        { name: 'Poción de Velocidad', effect: 0 }, // No afecta el daño
    ],
    effects: [
        { name: 'Efecto de Resistencia al fuego', effect: 0 }, // No afecta el daño
        { name: 'Efecto de Veneno', effect: 3 }, // Añade daño extra
        { name: 'Efecto de Regeneración', effect: 0 }, // No afecta el daño
        { name: 'Efecto de Rapidez', effect: 0 }, // No afecta el daño
        { name: 'Efecto de Congelación', effect: 2 }, // Añade daño extra
    ],
};

// Función para seleccionar un ítem aleatorio de cada tipo
function getRandomItem(category) {
    const randomIndex = Math.floor(Math.random() * category.length);
    return category[randomIndex];
}

// Función para calcular el daño final basado en los objetos seleccionados
function calculateFinalDamage(weapon, potion, effect, opponentArmor) {
    const totalDamage = weapon.damage + (potion?.effect || 0) + (effect?.effect || 0);
    const protection = opponentArmor.protection;

    return Math.max(0, totalDamage - protection); // El daño mínimo es 0
}

module.exports = {
    data: {
        name: 'pvp',
        description: 'Simula una batalla entre dos usuarios con actualización por turnos.',
    },
    async execute(message, args) {
        // Elimina el mensaje del comando
        await message.delete();

        // Verifica que se mencionen dos usuarios
        const user1 = message.mentions.users.first();
        const user2 = message.mentions.users.last();

        if (!user1 || !user2 || user1.id === user2.id) {
            return message.reply('¡Debes mencionar a dos usuarios diferentes para la batalla! c!pvp @usuario @usuario');
        }

        // Ambos usuarios comienzan con 20 puntos de vida
        let user1Life = 20;
        let user2Life = 20;

        // Selecciona los objetos aleatoriamente para cada usuario
        const user1Weapon = getRandomItem(items.weapons);
        const user1Armor = getRandomItem(items.armor);
        const user1Potion = getRandomItem(items.potions);
        const user1Effect = getRandomItem(items.effects);

        const user2Weapon = getRandomItem(items.weapons);
        const user2Armor = getRandomItem(items.armor);
        const user2Potion = getRandomItem(items.potions);
        const user2Effect = getRandomItem(items.effects);

        // Crea un embed inicial para mostrar los kits
        const initialEmbed = new EmbedBuilder()
            .setColor('#00bfff')
            .setTitle('⚔️ ¡Batalla PvP! ⚔️')
            .setDescription('Ambos jugadores han recibido sus kits. ¡Que comience el combate!')
            .addFields(
                { name: `Kits de ${user1.tag}`, value: `**Arma**: ${user1Weapon.name}\n**Armadura**: ${user1Armor.name}\n**Poción**: ${user1Potion.name}\n**Efecto**: ${user1Effect.name}`, inline: true },
                { name: `Kits de ${user2.tag}`, value: `**Arma**: ${user2Weapon.name}\n**Armadura**: ${user2Armor.name}\n**Poción**: ${user2Potion.name}\n**Efecto**: ${user2Effect.name}`, inline: true },
                { name: 'Estado Inicial', value: `${user1.tag}: 20/20\n${user2.tag}: 20/20` }
            )
            .setTimestamp();

        // Enviar mensaje inicial con los kits
        let battleMessage = await message.channel.send({ embeds: [initialEmbed] });

        // Simulación por turnos
        let turn = 1;
        const interval = setInterval(async () => {
            // Ambos jugadores atacan en cada turno
            const user1Damage = calculateFinalDamage(user1Weapon, user1Potion, user1Effect, user2Armor);
            const user2Damage = calculateFinalDamage(user2Weapon, user2Potion, user2Effect, user1Armor);

            // Reducir vida en función del daño
            user1Life = Math.max(0, user1Life - user2Damage);
            user2Life = Math.max(0, user2Life - user1Damage);

            // Crear el embed del turno actual
            const turnEmbed = new EmbedBuilder()
                .setColor('#f1c40f')
                .setTitle(`🔄 Turno ${turn}`)
                .setDescription(`La batalla continúa entre ${user1.tag} y ${user2.tag}!`)
                .addFields(
                    { name: `${user1.tag} ataca a ${user2.tag}`, value: `Causó ${user1Damage} de daño. Vida de ${user2.tag}: ${user2Life}/20`, inline: true },
                    { name: `${user2.tag} ataca a ${user1.tag}`, value: `Causó ${user2Damage} de daño. Vida de ${user1.tag}: ${user1Life}/20`, inline: true }
                )
                .setTimestamp();

            // Editar el mensaje para mostrar el nuevo estado del turno
            await battleMessage.edit({ embeds: [turnEmbed] });

            // Verificar si hay un ganador
            if (user1Life === 0 || user2Life === 0) {
                clearInterval(interval); // Detener la simulación

                let winner, loser, winnerLife;
                if (user1Life > 0) {
                    winner = user1;
                    loser = user2;
                    winnerLife = user1Life;
                } else {
                    winner = user2;
                    loser = user1;
                    winnerLife = user2Life;
                }

                // Porcentaje de vida restante del ganador
                const winnerLifePercentage = ((winnerLife / 20) * 100).toFixed(2);

                // Embed final con el resultado de la batalla
                const resultEmbed = new EmbedBuilder()
                    .setColor('#00ff00')
                    .setTitle(`🏆 ¡${winner.tag} ha ganado la batalla! 🏆`)
                    .setDescription(`${loser.tag} ha sido derrotado.`)
                    .addFields(
                        { name: 'Vida restante del ganador', value: `${winnerLife}/20 (${winnerLifePercentage}%)`, inline: true },
                        { name: 'Objetos usados por el ganador', value: `${winner === user1 ? user1Weapon.name : user2Weapon.name}, ${winner === user1 ? user1Armor.name : user2Armor.name}, ${winner === user1 ? user1Potion.name : user2Potion.name}, ${winner === user1 ? user1Effect.name : user2Effect.name}`, inline: true },
                        { name: 'Objetos usados por el perdedor', value: `${loser === user1 ? user1Weapon.name : user2Weapon.name}, ${loser === user1 ? user1Armor.name : user2Armor.name}, ${loser === user1 ? user1Potion.name : user2Potion.name}, ${loser === user1 ? user1Effect.name : user2Effect.name}`, inline: true }
                    )
                    .setTimestamp();

                // Editar el mensaje final con el resultado
                await battleMessage.edit({ embeds: [resultEmbed] });
            }

            turn++;
        }, 10000); // Cada 10 segundos realiza un turno
    },
};

