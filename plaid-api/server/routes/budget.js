const express = require("express");
const { getBudgetByUserId, setBudgetForCategoryType, getBudgetActualSumComparisons, removeBudgetForCategoryId } = require("../db/queries");

const router = express.Router();

router.get("/:userId", async (request, response, next) => {
    try {
        const { userId } = request.params;
        const budgetItems = await getBudgetByUserId(userId);
        response.json(budgetItems);
    } catch (err) {
        next(err);
    }
});

router.post("/", async (request, response, next) => {
    try {
        const { userId, categoryId, amount } = request.body;
        const budgetItem = await setBudgetForCategoryType(userId, categoryId, amount);
        response.json(budgetItem);
    } catch (err) {
        next(err);
    }
});

router.delete("/:userId/:categoryId", async (request, response, next) => {
    try {
        const { userId, categoryId } = request.params;
        await removeBudgetForCategoryId(userId, categoryId);
        response.json({success: true});
    } catch (err) {
        next(err);
    }
});

router.get("/get_budget_sum_comparison/:userId", async (request, response, next) => {
    try {
        const { userId } = request.params;
        const budgetSums = await getBudgetActualSumComparisons(userId);
        response.json(budgetSums);
    } catch(err) {
        next(err);
    }
});

module.exports = router;