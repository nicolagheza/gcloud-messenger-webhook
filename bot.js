const EventEmitter = require('events').EventEmitter,
  rp = require('request-promise');

class Bot {
  constructor(opts) {
    this.pageAccessToken = opts.pageAccessToken;
    this.verifyToken = opts.verifyToken;
    this.onMessage = (ctx, message) => {};
    this.onPostback = (ctx, postback) => {};
    this.onReferral = (ctx, referral) => {};
  }


  // A method that can be exported for a Google cloud function
  handleRequest(req, res) {
    if (req.method == 'GET') {
      this.handleGet.bind(this)(req, res);
    } else if (req.method == 'POST') {
      this.handlePost.bind(this)(req, res);
    }
  }

  sendResponse(psid, response) {
    let request_body = {
      "recipient": {
        "id": psid
      },
      "message": response
    }


    // Send the HTTP request to the Messenger Platform
    rp({
      "uri": "https://graph.facebook.com/v2.6/me/messages",
      "qs": {
        "access_token": this.pageAccessToken
      },
      "method": "POST",
      "body": request_body,
      "json": true
    }).then((body) => {

    }, (err) => {
      console.error("Unable to send message:" + err);
    })

  }


  getProfile(psid) {
    // Send the HTTP request to the Messenger Platform
    return rp({
      "uri": "https://graph.facebook.com/v2.6/" + psid,
      "qs": {
        "access_token": this.pageAccessToken,
        "fields": "first_name, last_name"
      },
      "method": "GET",
      "json": true
    });
  
  }

  /**
   * GET /webhook
   * Handles Messenger verification calls
   */
  handleGet(req, res) {
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];

    if (mode && token) {
      if (mode === 'subscribe' && token === this.verifyToken) {
        console.log('WEBHOOK_VERIFIED');
        res.status(200).send(challenge);

      } else {
        res.sendStatus(403);
      }
    } else {
      res.sendStatus(404);
    }
  }


  /**
   * POST /webhook
   * Handles webhook events from Messenger
   */
  handlePost(req, res) {
    let body = req.body;
    console.log("%j",  body)
    if (body.object === 'page') {
      body.entry.forEach((entry) => {
        let webhook_event = entry.messaging[0];
        let sender_psid = webhook_event.sender.id;

        let context = {
          send: this.sendResponse.bind(this, sender_psid),
          getProfile: this.getProfile.bind(this, sender_psid)
        }

        if (webhook_event.message) {
          this.onMessage.bind(this)(context, webhook_event.message);
        } else if (webhook_event.postback) {
          this.onPostback.bind(this)(context, webhook_event.postback);
        } else if (webhook_event.referral) {
          this.onReferral.bind(this)(context, webhook_event.referral);
        }
      });
      res.status(200).send('EVENT_RECEIVED');
    } else {
      res.sendStatus(404);
    }
  }


}

module.exports = Bot;
