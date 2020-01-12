const { inspect } = require("util");
const format = require("../modules/format.js");
const moment = require("moment");
const guildquests = require("../guildquests");

const actions = {
  add: {name: "add", desc: "Add stuff."}
};

exports.conf = {
  name: "gq",
  enabled: true,
  guildOnly: true,
  aliases: ["guildquest"],
  permLevel: "User"
};

exports.help = {
  category: "Guild",
  description: "Manage your guild quests",
  usage: `${exports.conf.name} [${Object.values(actions).map((v, _) => v.name).join("|")}] ...`,
};

exports.run = async (client, message, [action, ...value], level) => { // eslint-disable-line no-unused-vars

  // Retrieve Default Values from the default settings in the bot.
  const defaults = client.settings.get("default");

  // Adding a new key adds it to every guild (it will be visible to all of them)
  const add = async () => {
    if (value.length < 2) return message.reply("Please specify the name and server of the mission.");
    const [server, name] = value;

    const serverOptions = guildquests.getServers(server);
    const questOptions = guildquests.getMissions(name);

    if (serverOptions.length > 1){
      return message.reply(`Unclear server name ${server}.`);
    } else if (serverOptions.length == 0){
      return message.reply(`Unknown server ${server}.`);
    }
    
    var r;
    if (questOptions.length > 1){
      let msg = `Multiple options found:\n`;
      questOptions.forEach((v, idx) => msg += `<${idx + 1}> ${v}\n`);
      msg += `Select one by typing the number in the chat.`
      const response = await client.awaitReply(message, msg, {code: "asciidoc"});
      const idx = parseInt(response);
      if (idx > 0 && idx <= questOptions.length){
        r = questOptions[idx-1];
      }else{
        return message.reply("Invalid value.");
      }
    }else if (questOptions.length == 1){
      r = questOptions[0];
    }else{
      return message.reply(`No quest found for ${name}.`);
    }

    const quest = {
      server: serverOptions[0],
      desc: r[0],
      end: moment().add(r[1], 'minutes')
    };
    const gqs = client.gq.lists.get(message.guild) || [];
    gqs.push(quest);
    client.gq.lists.set(message.guild, gqs);
    
    message.reply(`Add guild mission ${quest.desc} on server ${quest.server}.`);
  };

  if (!action){
    return message.reply(format.formatUsage(actions));
  }

  switch(action){
    case actions.add.name: add(); break;
    default:
      return message.reply(`Unknown action ${action}. Supported actions are: ${Object.values(actions).join(", ")}`);
  }
};
