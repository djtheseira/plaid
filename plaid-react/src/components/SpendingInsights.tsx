import React from "react";
import { Chart as ChartJS, ArcElement, Colors, Tooltip, Legend, ChartOptions } from 'chart.js';
import { Pie } from "react-chartjs-2";
import ChartDataLabels, { Context } from "chartjs-plugin-datalabels"
import { TransactionSumType, VendorType } from "./types";
import { humanReadableCategory } from "../util";

ChartJS.register(ArcElement, ChartDataLabels, Colors, Tooltip, Legend);

interface Props {
    userId: number,
    transactionSums: any[],
    topVendors: VendorType[]
}

export default function SpendingInsights(props: Props) {
    const backgroundColors: string[] = [];
    const borderColors: string[] = [];

    const generateHSLColor = () => {
        const h = Math.floor(Math.random() * 360),
            s = Math.floor(Math.random() * 80 + 30) + '%',
            l = Math.floor(Math.random() * 60 + 20) + '%';
        return `hsl(${h},${s},${l})`;
    }

    const generateBackgroundBorderColors = () => {
        props.transactionSums.forEach(() => {
            const color = generateHSLColor();
            backgroundColors.push(color);
            borderColors.push(color);
        });

        return { backgroundColors: backgroundColors, borderColors: borderColors };
    }

    generateBackgroundBorderColors();

    const config = {
        labels: props.transactionSums.map((trx: TransactionSumType) => humanReadableCategory(trx.category_type)),
        datasets: [{
            id: 1,
            label: '$',
            data: props.transactionSums.map((trx: TransactionSumType) => trx.sum),
            // backgroundColor: backgroundColors,
            // borderColor: "#fff"
        }],
        plugins: [ChartDataLabels]
    };

    const chartOptions: ChartOptions = {
        plugins: {
            datalabels: {
                backgroundColor(context: Context) {
                    const dataset = context.dataset;
                    const dataIndex = context.dataIndex;
                    const backgroundColor: any = dataset.backgroundColor;
                    if (backgroundColor != null && backgroundColor[dataIndex] != null) {
                        return backgroundColor[dataIndex];
                    }

                    return "#ffffff";
                },
                borderColor: "#ffffff",
                borderRadius: 25,
                borderWidth: 2,
                color: "#ffffff",
                padding(context) {
                    return {
                        top: 5,
                        bottom: 5,
                        left: 15,
                        right: 15
                    }
                },
            }
        }
    }


    return (
        <div className="user-page-container-section" >
            <div >
                <h5 className="fw-semibold">Spending Insights</h5>
                <p >Monthly spending breakdown</p>
            </div>
            <div className="d-flex flex-row gap-5 text-center">
                <div className="col-6 p-5 spending-insights-container__column_container" >
                    <p className="mt-3" >Spending Breakdown</p>
                    <Pie data={config} options={chartOptions} />
                </div>
                <div className="col-6" >
                    <div className="spending-insights-container__column_container h-100 d-flex flex-column p-5">
                        <p className="my-3" >Top 5 Vendors</p>
                        { 
                            props.topVendors.length > 0 ? 
                                <div className="spending-insights-top-vendor-container d-flex flex-column flex-fill justify-content-between">
                                    {props.topVendors.map((vendor:VendorType, index:number) => {
                                        return <div key={`top-vender-${index}`} className="d-flex flex-row justify-content-between">
                                            <div >{vendor.merchant_name}</div>
                                            <div >${vendor.sum}</div>
                                        </div>
                                    })}
                                </div> : null
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}