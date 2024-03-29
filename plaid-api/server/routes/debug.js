const express = require("express");
const { getItemsAndAccessTokensForUser } = require("../db/queries");
const { test } = require("../db/queries/transactions");
const { plaidClient } = require("../../plaid");
const { SandboxItemFireWebhookRequestWebhookCodeEnum, WebhookType} = require("plaid");
const router = express.Router();

/**
 * This code will eventually be used to generate a test webhook, which can
 * be useful in sandbox mode where webhooks aren't quite generated like
 * they are in production.
 */
router.post("/generate_webhook/:userId", async (req, res, next) => {
    try {
        const {userId} = req.params;

        const itemsAndTokens = await getItemsAndAccessTokensForUser(userId);
        const randomItem = itemsAndTokens[Math.floor(Math.random() * itemsAndTokens.length)];
        const accessToken = randomItem.plaid_access_token;
        plaidClient.itemWebhookUpdate 
        const result = await plaidClient.sandboxItemFireWebhook({
            webhook_code:
                SandboxItemFireWebhookRequestWebhookCodeEnum.SyncUpdatesAvailable,
            access_token: accessToken,
        });
        res.json(result.data);
    } catch (error) {
        next(error);
    }
});

router.get("/test", async(req, res, next) => {
    try {
        res.json(await test());
    } catch (err) {
        next(err);
    }
})

module.exports = router;