import paymentModel from '../models/payment.model.js'
import userModel from "../models/user.model.js";
import AppError from "../utils/error.utils.js";

import crypto from 'crypto';

export const razorpay = {
    subscriptions: {
        create: async () => ({
            id: 'mock_subscription_id',
            status: 'active'
        }),
        cancel: async () => ({
            status: 'cancelled'
        }),
        all: async () => ({
            items: [
                { id: 'mock_subscription_id', status: 'active' }
            ]
        })
    }
};

export const getRazorPayApiKey = async (req, res, next) => {
    try {
        res.status(200).json({
            success: true,
            message: "Razorpay API Key",
            key: "test_key_id" 
        })
    } catch (e) {
        return next(new AppError(e.message, 500))
    }
};

export const buySubscription = async (req, res, next) => {
    try {
        const { id } = req.user;
        const user = await userModel.findById(id);

        if (!user) {
            return next(new AppError("Unauthorized, please login"));
        }

        if (user.role === "ADMIN") {
            return next(new AppError("Admin cannot purchase a subscription", 400));
        }

        const subscription = await razorpay.subscriptions.create();

        user.subscription.id = subscription.id;
        user.subscription.status = subscription.status;

        await user.save();

        res.status(200).json({
            success: true,
            message: "Subscribed Successfully",
            subscription_id: subscription.id,
        });
    } catch (e) {
        return next(new AppError(e.message, 500));
    }
};

export const verifySubscription = async (req, res, next) => {
    try {
        const { id } = req.user;
        const { razorpay_payment_id, razorpay_signature, razorpay_subscription_id } = req.body;

        const user = await userModel.findById(id);
        if (!user) {
            return next(new AppError('Unauthorised, please login', 500))
        }

        const subscriptionId = user.subscription.id;

        console.log("⚠️ Skipping Razorpay signature verification in testing mode");

        await paymentModel.create({
            razorpay_payment_id: razorpay_payment_id || 'mock_payment_id',
            razorpay_signature: razorpay_signature || 'mock_signature',
            razorpay_subscription_id: razorpay_subscription_id || subscriptionId
        });

        user.subscription.status = 'active';
        await user.save();

        res.status(200).json({
            success: true,
            message: "Payment Verified Successfully"
        });
    } catch (e) {
        return next(new AppError(e.message, 500))
    }
};

export const cancelSubscription = async (req, res, next) => {
    const { id } = req.user;

    const user = await userModel.findById(id);

    if (user.role === 'ADMIN') {
        return next(
            new AppError('Admin does not need to cancel subscription', 400)
        );
    }

    const subscriptionId = user.subscription.id;

    try {
        const subscription = await razorpay.subscriptions.cancel(subscriptionId);

        user.subscription.status = subscription.status;

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Subscription cancelled',
            subscriptionStatus: subscription.status
        });

    } catch (error) {
        return next(new AppError(error.message || 'Failed to cancel subscription', 500));
    }
};

export const allPayments = async (req, res, next) => {
    try {
        const { count } = req.query;

        const subscriptions = await razorpay.subscriptions.all({
            count: count || 10,
        });

        res.status(200).json({
            success: true,
            message: 'All Payments',
            allPayments: subscriptions
        });
    } catch (e) {
        return next(new AppError(e.message, 500));
    }
};
