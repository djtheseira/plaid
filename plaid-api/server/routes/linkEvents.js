const express = require("express");
const { createLinkEvent } = require("../db/queries");

const router = express.Router();

router.post("/", async (request, response, next) => {
    Promise.resolve()
        .then( async () => {
            await createLinkEvent(request.body);   
            response.sendStatus(200); 
        })
        .catch(err => {
            console.log(err.response);
            next(err);
        });
});

module.exports = router;