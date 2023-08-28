const express = require("express");
const { getBudgetCategoryTypes, getBudgetCategories } = require("../db/queries");

const router = express.Router();

router.get("/types", async (request, response, next) => {
    try {
        const categoryTypes = await getBudgetCategoryTypes();
        response.json(categoryTypes);
    } catch (err) {
        next(err);
    }
});

router.get("/", async (request, response, next) => {
    try {
        const categories = await getBudgetCategories();
        response.json(categories);
    } catch (err) {
        next(err);
    }
});

module.exports = router;