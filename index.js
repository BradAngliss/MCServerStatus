const Discord = require('discord.js');
const dotenv = require('dotenv');
const mcPinger = require('minecraft-pinger')

const client = new Discord.Client();

const prefix = "!";
// const ipFormat = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
const ipFormat = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?|^((http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/;

dotenv.config();

client.once('ready', () => {
    console.log('Ready!');
});

client.on('message', async message => {
    if (!message.content.startsWith(prefix)) return;

    let ip, port = 25565;
    const args = message.content.trim().split(/ +/g); // Split by spaces
    const cmd = args[0].slice(prefix.length).toLowerCase();
    const embeddedResponse = new Discord.MessageEmbed();

    if (cmd === 'mc') {
        ip = args[1];
        if (ipFormat.test(ip)) {
            if (args.length === 3 && Number.isInteger(Number(args[2]))) {
                port = args[2];
            }

            mcPinger.ping(`${ip}`, port, async (error, data) => {
                if (error) {
                    message.reply("The server is not available");
                    return console.error(error)
                }
                message.reply(`Pinging ${ip}::${port}`)
                playersOnlineString = getPlayersList(data.players.sample);

                console.log(data)

                embeddedResponse
                    .setColor('#0099ff')
                    .setTitle(`Server: ${ip}`)
                    .setDescription(`${data.description.text}`)
                    .setAuthor("Author: Brad Angliss")
                    .addFields(
                        { name: `Players Online: ${data.players.online}`, value: `${playersOnlineString}` },
                        { name: 'Maximum Players', value: `${data.players.max}` },
                        { name: 'Ping', value: `${data.ping}` },
                    )
                    .setTimestamp()

                if (data.favicon !== undefined) {
                    const attachment = buildAttachment(data.favicon)

                    embeddedResponse
                        .attachFiles([attachment])
                        .setThumbnail("attachment://favicon.png");
                }

                message.reply(embeddedResponse)
            })
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
    if (playerList != undefined) {
        for (var value of playerList) {
            stringBuilder += value.name + "\n";
        }
        return stringBuilder;
    }
    return "No Player Information Available";
}

function buildAttachment(favicon) {
    var fav = favicon.split(",").slice(1).join(",");
    var imageStream = Buffer.from(fav, "base64");
    var attachment = new Discord.MessageAttachment(imageStream, "favicon.png");

    return attachment;
}