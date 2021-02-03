const Discord = require('discord.js');
const dotenv = require('dotenv');
const mcPinger = require('minecraft-server-ping')

const client = new Discord.Client();

const prefix = "!";
const ipFormat = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

dotenv.config();

client.once('ready', () => {
    console.log('Ready!');
});

client.on('message', async message => {
    if (!message.content.startsWith(prefix)) return;

    let ip, data, playerOnlineString, port = 25565;
    const args = message.content.trim().split(/ +/g); // Split by spaces
    const cmd = args[0].slice(prefix.length).toLowerCase();
    const embeddedResponse = new Discord.MessageEmbed();

    if (cmd === 'mc') {
        ip = args[1];
        if (ipFormat.test(ip)) {
            try {
                if (args.length === 3 && Number.isInteger(Number(args[2]))) {
                    port = args[2];
                }

                message.reply(`Pinging ${ip}::${port}`)
                data = await mcPinger.ping(ip, port);
                playersOnlineString = getPlayersList(data.players.sample);

                embeddedResponse
                    .setColor('#0099ff')
                    .setTitle(`Server: ${ip}`)
                    .setDescription(`${data.description.text}`)
                    .setURL('https://discord.js.org/')
                    // .setAuthor('Brad Angliss')
                    .addFields(
                        { name: `Players Online: ${data.players.online}`, value: `${playersOnlineString}` },
                        { name: 'Maximum Players', value: `${data.players.max}` },
                        { name: 'Ping', value: `${data.ping}` },
                    )
                    .setTimestamp()

                if (data.favicon !== undefined) {
                    embeddedResponse.setThumbnail(`${data.favicon}`);
                }

                message.reply(embeddedResponse)
            } catch (e) {
                message.reply("The server is not available")
            }
        } else {
            message.reply("Invalid IP Address Given")
        }
    } else if (cmd === "args") {
        message.reply("!mc ipAddress [port default=25565]")
    }
})

client.login(process.env.TOKEN);

function getPlayersList(playerList) {
    var stringBuilder = "";
    for (var value of playerList) {
        stringBuilder += value.name + "\n";
    }
    return stringBuilder;
}