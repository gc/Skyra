const snekfetch = require("snekfetch");
const { XmlEntities } = require("html-entities");
const constants = require("../../utils/constants");

const { decode } = new XmlEntities();

exports.run = async (client, msg, [input]) => {
    const data = await snekfetch.get(`https://glosbe.com/gapi/translate?from=en&dest=en&format=json&phrase=${encodeURIComponent(input)}`).then(d => JSON.parse(d.text));
    if (!data.tuc || !data.tuc[0]) throw constants.httpResponses(404);

    const final = [];
    let index = 1;
    for (let item of Object.entries(data.tuc.find(t => t.meanings).meanings.slice(0, 5))) { // eslint-disable-line no-restricted-syntax
        item = decode(item[1].text.replace(/<\/?i>/g, ""));
        final.push(`**\`${index}\` ❯** ${item.replace(/`/g, "\\`")}`);
        index++;
    }

    return msg.send(`Search results for \`${input}\`:\n${final.join("\n")}`);
};

exports.conf = {
    enabled: true,
    runIn: ["text", "dm", "group"],
    aliases: [],
    permLevel: 0,
    botPerms: [],
    requiredFuncs: [],
    spam: false,
    mode: 1,
    cooldown: 15,
};

exports.help = {
    name: "define",
    description: "Check the meaning of a word or a phrase.",
    usage: "<input:string>",
    usageDelim: "",
    extendedHelp: [
        "What does \"heel\" mean?",
        "",
        " ❯ Input :: The word or phrase you want to get the definition from.",
        "",
        "Examples:",
        "&define heel",
        "❯❯ 1 ❯ tilt to one side; \"The balloon heeled over\"; \"the wind made the vessel heel\"; \"The ship listed to starboard\"",
        "❯❯ 2 ❯ To arm with a gaff, as a cock for fighting.",
        "❯❯ 3 ❯ In a carding machine, the part of a flat nearest the cylinder.",
        "❯❯ 4 ❯ part of shoe",
        "❯❯ 5 ❯ The part of a shoe's sole which supports the foot's heel.",
    ].join("\n"),
};