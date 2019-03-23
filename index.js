//Config stuff
const config = require('./config.json'),
access = require('./access.json'),

//Packages
mineflayer = require('mineflayer'),
fs = require('fs'),
hypixel = require('hypixeljs');

//Setup bot, Hypixel API and chat logging
hypixel.login(access.api_key);
var bot = mineflayer.createBot({
  host: '172.65.128.21',
  port: 25565,
  version: '1.12.2',
  username: access.ingame.email,
  password: access.ingame.password,
  keepAlive: true,
  checkTimeoutInterval: 30*1000
});
//Uncomment to log chat:
//bot.on('message', message => console.log(`[CHAT] ${message.toString()}`));


bot.on('login', () => {
  limbo();
  setInterval(() => {
    lobby();
    setTimeout(() => checkAmounts(), 6*1000);
  }, (3*60*1000)-(6*1000));
});

//Fetches network player count and proceeds to parse armor stand names
function checkAmounts() {
  hypixel.playersOnline((err, totalCount) => {
    if (err) return console.log(err);
    fetchAmounts(totalCount); //Fetch network player count with HypixelJS
  });
}

//Parses armor stand names & writes to playerCounts.json
function fetchAmounts(totalCount) {
  var playerCounts = JSON.parse(fs.readFileSync(config.dataFilePath));
  playerCounts.total = totalCount;
  const entities = JSON.parse(JSON.stringify(bot.entities));

  for (var entity in entities) if (entities.hasOwnProperty(entity)) {
    entity = entities[entity];
    const name = entity.metadata['2'],
    pos = entity.position;

    if (entity.name == 'armor_stand' && /^§e[0-9,]+ Playing§r$/.test(name)) {
      for (var gameName in config.gameStands) if (config.gameStands.hasOwnProperty(gameName)) {
        var game = config.gameStands[gameName];
        if (game.pos[0] == pos.x && game.pos[1] == pos.y && game.pos[2] == pos.z) {
          const amount = parseInt(name.replace(/^§e|,| Playing§r$/g, ''));
          playerCounts[gameName] = amount;
        }
      }
    }
  }
  fs.writeFileSync(config.dataFilePath, JSON.stringify(playerCounts, null, 2));
  limbo();
}


//Bot methods
function limbo() {
  setTimeout(() => bot.chat('/ac §c'), 5*1000);
}

function lobby() {
  bot.chat('/l main');
}
