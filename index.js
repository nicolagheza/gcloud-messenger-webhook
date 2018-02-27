const Bot = require('./bot.js')

var bot = new Bot({
  pageAccessToken: 'EAATr16XBVMABAEc02KHtCcVgaSdiuaZCglGluGKS98RvsdKcZAEswAFNS6w7psLi46bks7mCPt3IqgTN6uQnT9dqHL7wI9rXsSqDzyaMFNBE3V2jem82jyKWTSlNFzfR2GnR7j9tJtJ29fEL1kCdaj0egLHWmZA9DI5hak7zAZDZD',
  verifyToken: "<YOUR_VERIFY_TOKEN>"
})


/*
 * Implement your custom onMessage and onPostback methods.
 * ctx contains methods:
 *      send(response) -> Promise 
 *      getProfile() -> Promise
 */


bot.onMessage = async (ctx, message) => {
    var profile = await ctx.getProfile();
    console.log(profile)
    let response = {
      "text": `Hey ${profile.first_name}. You look like an ugly cunt!`
    }

  if(!response) return;
  ctx.send(response)

}


bot.onPostback = async (ctx, postback) => {
  console.log(postback);

  if(postback.title === 'HELLO?'){
    let profile = await ctx.getProfile();
    console.log(profile)
    let response = {
      "text": `Hey ${profile.first_name}. You look like an ugly cunt!`
    }

    ctx.send(response);
  }
}

bot.onReferral = async (ctx, postback) => {
    let profile = await ctx.getProfile();
    console.log(profile)
    let response = {
      "text": `Hey ${profile.first_name}. You look like an ugly cunt!`
    }

    ctx.send(response); 
}

//Export the bot HTTP handler
exports.webhook = (req, res) => {
  bot.handleRequest(req, res);
};
