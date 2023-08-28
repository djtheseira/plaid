import React, {
    useEffect,
    useState,
} from "react";
import { getBudgetCategories } from "../services/api";
import { BudgetType, Category } from "./types";
import { BudgetCategoryCard } from ".";
import { humanReadableCategory } from "../util";
import { Button, ButtonGroup, Dropdown } from "react-bootstrap";
import { filter, groupBy, map } from "lodash";
import { useBudget } from "../services";
import { useParams } from "react-router-dom";

interface Props {}

export default function BudgetPage(props: Props) {
    const { userId } = useParams();
    const [categories, setCategories] = useState([]);
    const {
        updateBudgetForCategoryType,
        budgetByCategory,
        setBudgetByUserCategoryTypeId,
    } = useBudget();

    useEffect(() => {
        const getCategories = async () => {
            const response = await getBudgetCategories();
            if (response.status === 200) {
                setCategories(response.data);
            }
        };
        getCategories();
    }, []);

    const categoryItemSelectHandler = (eventKey: any, event: Object) => {
        if (isNaN(eventKey as number)) return eventKey;
        const selectedCategory = categories.find(
            (category: Category) =>
                category.category_id === Number.parseInt(eventKey)
        ) as Category | any;
        updateBudgetForCategoryType(
            -1,
            Number.parseInt(userId ?? "0"),
            Number.parseInt(eventKey),
            0,
            selectedCategory?.category ?? ""
        );
    };

    const onSaveBudgetSettingsClickHandler = () => {
        setBudgetByUserCategoryTypeId(parseInt(userId ?? "0"));
    };

    return (
        <div
            className="user-page-container-section mt-5"
            id="budget-setting-container"
        >
            <div className="mb-3 d-flex flex-row gap-5 align-items-center">
                <h5 className="fw-semibold">Budget Settings</h5>
                <div className="btn-container">
                    <Button
                        onClick={onSaveBudgetSettingsClickHandler}
                        className={`${
                            budgetByCategory != null &&
                            Object.keys(budgetByCategory).length > 0
                                ? ""
                                : "disabled"
                        }`}
                    >
                        Save Budget Settings
                    </Button>
                </div>
            </div>
            {categories.length > 0 ? (
                <Dropdown onSelect={categoryItemSelectHandler}>
                    <Dropdown.Toggle as={Button} >Select Category</Dropdown.Toggle>
                    <Dropdown.Menu align={"start"} id="budget-category-select-dropdown" >
                        {
                            Object.entries(groupBy(
                                categories.filter(
                                    (category: Category) =>
                                        budgetByCategory[category.category_id] == null
                                            || !budgetByCategory[category.category_id]?.hideLocally
                                ),
                                "category_type"
                            )).map((groupedType: any[], index: number) =>{
                                const categoryType = humanReadableCategory(groupedType[0]);
                                const categories = groupedType[1] as Category[];

                                return (
                                    <div key={`category-type-${index}`}>
                                        <Dropdown.Header >{categoryType}</Dropdown.Header>
                                        { categories.map((category: Category) => (
                                            <Dropdown.Item key={`category-${category.category_id}`} eventKey={category.category_id} >{humanReadableCategory(category.category)}</Dropdown.Item>
                                        ))}
                                        <Dropdown.Divider />
                                    </div>
                                )
                            })
                        }
                    </Dropdown.Menu>
                    
                </Dropdown>
            ) : null}
            
            { budgetByCategory != null && filter(budgetByCategory, (budget: BudgetType) => !budget.hide_locally).length > 0
                ? 
                <div className="mt-5" id="budget-settings-container">
                    {
                        map(budgetByCategory, (i) => {
                            const budget = i as BudgetType;
                            if (budget.hide_locally) return null;
                            return (
                                <BudgetCategoryCard
                                    budget={budget}
                                    key={`budget-item-${budget.category_id}`}
                                />
                            );
                        })
                    }
                </div>
                : null }
        </div>
    );
}
