import { RequestHandler } from "express";
import { Order } from "../order-model";
import { Product } from "../../product/product-model";

export const getAnalytics: RequestHandler = async (req, res) => {
    try {
        
        const overallStats = await Order.aggregate([
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$totalPrice" },
                    totalOrders: { $sum: 1 },
                    avgOrderValue: { $avg: "$totalPrice" }
                }
            }
        ]);

        const kpis = {
            totalRevenue: overallStats[0]?.totalRevenue || 0,
            totalOrders: overallStats[0]?.totalOrders || 0,
            avgOrderValue: Math.round(overallStats[0]?.avgOrderValue || 0),
        };

        
        const statusCounts = await Order.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]);

        const statusDistribution: Record<string, number> = {
            pending: 0,
            processing: 0,
            shipped: 0,
            delivered: 0
        };
        statusCounts.forEach(item => {
            if (item._id in statusDistribution) {
                statusDistribution[item._id] = item.count;
            }
        });

        
        const startOf30DaysAgo = new Date();
        startOf30DaysAgo.setDate(startOf30DaysAgo.getDate() - 30);
        startOf30DaysAgo.setHours(0, 0, 0, 0);

        const dailySales = await Order.aggregate([
            { $match: { createdAt: { $gte: startOf30DaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    revenue: { $sum: "$totalPrice" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const trendData = [];
        const dateCursor = new Date(startOf30DaysAgo);
        const today = new Date();
        today.setHours(23, 59, 59, 999);

        
        const salesMap = new Map<string, { revenue: number; count: number }>();
        dailySales.forEach(item => {
            salesMap.set(item._id, { revenue: item.revenue, count: item.count });
        });

        while (dateCursor <= today) {
            const dateStr = dateCursor.toISOString().split("T")[0];
            const stat = salesMap.get(dateStr) || { revenue: 0, count: 0 };
            trendData.push({
                date: dateStr,
                revenue: stat.revenue,
                orders: stat.count
            });
            dateCursor.setDate(dateCursor.getDate() + 1);
        }

        
        const bestSellers = await Order.aggregate([
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.productID",
                    totalSold: { $sum: "$items.quantity" },
                    totalRevenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
                }
            },
            { $sort: { totalSold: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: "products",
                    localField: "_id",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },
            { $unwind: "$productDetails" },
            {
                $project: {
                    _id: 1,
                    totalSold: 1,
                    totalRevenue: 1,
                    name: "$productDetails.name",
                    imageCover: "$productDetails.imageCover",
                    price: "$productDetails.price"
                }
            }
        ]);

        
        const governorateSales = await Order.aggregate([
            {
                $group: {
                    _id: "$shippingAddress.city",
                    revenue: { $sum: "$totalPrice" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { revenue: -1 } },
            { $limit: 6 }
        ]);

        const governorateData = governorateSales.map(item => ({
            city: item._id || "غير محدد",
            revenue: item.revenue,
            orders: item.count
        }));

        return res.status(200).json({
            message: "Analytics data fetched successfully",
            data: {
                kpis,
                statusDistribution,
                trend: trendData,
                bestSellers,
                governorates: governorateData
            }
        });

    } catch (error) {
        console.error("Get Analytics Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
