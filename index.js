const praw = require('praw');
const discord = require('discord');
const asyncio = require('asyncio');
const pickle = require('pickle');
const os = require('os');
const time = require('time');
const { commands, Bot } = require('discord.ext');

const token = '';
const bot = new Bot({ command_prefix: '!' });
let isSet = false;
let tempID = '80ib9u';
let channel = '';

// translate, give me access to Reddit Hexa?
const reddit = praw.Reddit({
  client_id: '',
  client_secret: '',
  user_agent: '',
  username: '',
  password: ''
});

const subreddit = reddit.subreddit('me_irl');

// DISCORD

// PING COMMAND
bot.command('ping', async (ctx) => {
  await ctx.send(ctx.message.author.mention + ' pong!', { delete_after: 5 });
  await ctx.message.delete({ delay: 5 });
});

// SET COMMAND TO START BROADCAST
bot.command('set', async (ctx) => {
  if (!isSet) {
    isSet = true;
    channel = ctx.message.channel;
    pickle.dump(channel.id, open('channel.obj', 'wb'));
    await ctx.send('Broadcast started!', { delete_after: 5 });
    await ctx.message.delete({ delay: 5 });
    await broadcast();
  } else {
    await ctx.send('Already broadcasting!', { delete_after: 5 });
    await ctx.message.delete({ delay: 5 });
  }
});

// UNSET COMMAND TO STOP BROADCAST
bot.command('unset', async (ctx) => {
  if (isSet) {
    isSet = false;
    os.remove('channel.obj');
    await ctx.send('Broadcast stopped!', { delete_after: 5 });
    await ctx.message.delete({ delay: 5 });
  } else {
    await ctx.send('Bot is not broadcasting!', { delete_after: 5 });
    await ctx.message.delete({ delay: 5 });
  }
});

// ERROR HANDLER
bot.event('on_command_error', async (ctx, error) => {
  if (error instanceof commands.CheckFailure) {
    await ctx.send('Insufficient permission!', { delete_after: 5 });
    await ctx.message.delete({ delay: 5 });
  } else {
    await ctx.send('Error!', { delete_after: 5 });
    await ctx.message.delete({ delay: 5 });
  }
});

// START EVENT
bot.event('on_ready', async () => {
  if (os.path.isfile('channel.obj')) {
    isSet = true;
    channel = bot.get_channel(pickle.load(open('channel.obj', 'rb')));
    tempID = pickle.load(open('tempID.obj', 'rb'));
    console.log('Found old session!');
    await broadcast();
  }
});

// BROADCAST FUNCTION
async function broadcast() {
  console.log('Broadcast started on ' + str(channel) + ' #' + str(channel.id));
  await bot.change_presence({ activity: discord.Game({ name: 'me_irl broadcast' }) });
  while (isSet) {
    for (submission in subreddit.hot({ limit: 1 })) {
      if (submission.id != tempID) {
        console.log(submission.url);
        reddit.submission({ id: tempID }).hide();
        await channel.send(submission.url);
        tempID = submission.id;
        pickle.dump(tempID, open('tempID.obj', 'wb'));
      } else {
        console.log('----- ' + str(time.ctime()) + ' -----');
      }
    }
    await asyncio.sleep(60);
  }
  console.log('Broadcast stopped!');
  await bot.change_presence({ activity: None });
}

bot.run(token)
