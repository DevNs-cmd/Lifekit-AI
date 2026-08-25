import { Injectable, BadRequestException, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service";
import * as crypto from "crypto";
import { Prisma } from "@prisma/client";

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Creates a Razorpay order. If keys are not configured in .env,
   * it falls back to a simulated mock order configuration.
   */
  async createOrder(userId: number, planId: string) {
    const plan = planId.toLowerCase();
    let amount = 0;
    if (plan === "plus") {
      amount = 499; // ₹499
    } else if (plan === "pro") {
      amount = 999; // ₹999
    } else {
      throw new BadRequestException("Invalid plan selected");
    }

    const keyId = this.configService.get<string>("RAZORPAY_KEY_ID") || process.env.RAZORPAY_KEY_ID;
    const keySecret = this.configService.get<string>("RAZORPAY_KEY_SECRET") || process.env.RAZORPAY_KEY_SECRET;

    // Use a multiplier of 100 as Razorpay expects amounts in paise
    const amountInPaise = amount * 100;

    if (!keyId || !keySecret || keyId.includes("xxxxxxxxxxxx")) {
      // Return a simulated mock order for development Sandbox
      this.logger.log(`No Razorpay keys configured. Using mock order ID for user ${userId}.`);
      const mockOrderId = `order_mock_${crypto.randomBytes(8).toString("hex")}`;
      return {
        orderId: mockOrderId,
        amount: amountInPaise,
        currency: "INR",
        keyId: "rzp_test_placeholder",
        isMock: true,
      };
    }

    try {
      const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
      const response = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${auth}`,
        },
        body: JSON.stringify({
          amount: amountInPaise,
          currency: "INR",
          receipt: `receipt_sub_${userId}_${Date.now()}`,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Razorpay API returned status ${response.status}: ${errorText}`);
      }

      const resJson: any = await response.json();
      return {
        orderId: resJson.id,
        amount: resJson.amount,
        currency: resJson.currency,
        keyId,
        isMock: false,
      };
    } catch (err: any) {
      this.logger.error("Failed to create Razorpay order", err.stack);
      throw new BadRequestException(`Payment gateway order creation failed: ${err.message}`);
    }
  }

  /**
   * Verifies Razorpay payment signature and activates the user subscription.
   */
  async verifyPayment(
    userId: number,
    dto: {
      orderId: string;
      paymentId: string;
      signature?: string;
      planId: string;
      isMock?: boolean;
    },
  ) {
    const keySecret = this.configService.get<string>("RAZORPAY_KEY_SECRET") || process.env.RAZORPAY_KEY_SECRET;
    const isMock = dto.isMock || !keySecret || keySecret.includes("change-me-to-your-razorpay-secret");

    if (!isMock) {
      if (!dto.signature) {
        throw new BadRequestException("Payment signature is required for verification");
      }
      // Cryptographic signature verification
      const text = `${dto.orderId}|${dto.paymentId}`;
      const generatedSignature = crypto
        .createHmac("sha256", keySecret!)
        .update(text)
        .digest("hex");

      if (generatedSignature !== dto.signature) {
        this.logger.warn(`Signature verification failed for user ${userId}`);
        throw new BadRequestException("Invalid payment signature");
      }
    } else {
      this.logger.log(`Verified mock payment successfully for user ${userId}.`);
    }

    // Activate the subscription in database
    return this.activateSubscription(userId, dto.planId);
  }

  /**
   * Cancels the active subscription for a user.
   */
  async cancelSubscription(userId: number) {
    await this.prisma.subscriptions.updateMany({
      where: {
        user_id: userId,
        status: "ACTIVE",
      },
      data: {
        status: "INACTIVE",
        updated_at: new Date(),
      },
    });

    return { success: true, message: "Subscription cancelled successfully" };
  }

  /**
   * Deactivates older active subscriptions and creates a new active subscription row.
   */
  private async activateSubscription(userId: number, planId: string) {
    const plan = planId.toLowerCase();
    let amount = 0;
    if (plan === "plus") {
      amount = 499;
    } else if (plan === "pro") {
      amount = 999;
    }

    // 1. Deactivate existing active subscriptions
    await this.prisma.subscriptions.updateMany({
      where: {
        user_id: userId,
        status: "ACTIVE",
      },
      data: {
        status: "INACTIVE",
        updated_at: new Date(),
      },
    });

    // 2. Create new active subscription
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30); // Valid for 30 days

    const subscription = await this.prisma.subscriptions.create({
      data: {
        user_id: userId,
        plan_name: plan.toUpperCase(),
        status: "ACTIVE",
        amount: new Prisma.Decimal(amount),
        billing_cycle: "MONTHLY",
        start_date: startDate,
        end_date: endDate,
      },
    });

    this.logger.log(`Activated ${plan.toUpperCase()} plan for user ${userId}.`);

    return subscription;
  }

  /**
   * Creates a Razorpay order for marketplace purchases.
   */
  async createMarketplaceOrder(userId: number, listingId: number, amount: number) {
    if (amount <= 0) {
      throw new BadRequestException("Amount must be greater than 0");
    }

    const keyId = this.configService.get<string>("RAZORPAY_KEY_ID") || process.env.RAZORPAY_KEY_ID;
    const keySecret = this.configService.get<string>("RAZORPAY_KEY_SECRET") || process.env.RAZORPAY_KEY_SECRET;

    const amountInPaise = Math.round(amount * 100);

    if (!keyId || !keySecret || keyId.includes("xxxxxxxxxxxx")) {
      this.logger.log(`No Razorpay keys configured. Using mock order ID for marketplace listing ${listingId}, user ${userId}.`);
      const mockOrderId = `order_mkt_mock_${crypto.randomBytes(8).toString("hex")}`;
      return {
        orderId: mockOrderId,
        amount: amountInPaise,
        currency: "INR",
        keyId: "rzp_test_placeholder",
        isMock: true,
      };
    }

    try {
      const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
      const response = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${auth}`,
        },
        body: JSON.stringify({
          amount: amountInPaise,
          currency: "INR",
          receipt: `receipt_mkt_${listingId}_${userId}_${Date.now()}`,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Razorpay API returned status ${response.status}: ${errorText}`);
      }

      const resJson: any = await response.json();
      return {
        orderId: resJson.id,
        amount: resJson.amount,
        currency: resJson.currency,
        keyId,
        isMock: false,
      };
    } catch (err: any) {
      this.logger.error("Failed to create Razorpay marketplace order", err.stack);
      throw new BadRequestException(`Marketplace order creation failed: ${err.message}`);
    }
  }

  /**
   * Verifies Razorpay payment signature for marketplace purchases.
   */
  async verifyMarketplacePayment(
    userId: number,
    dto: {
      orderId: string;
      paymentId: string;
      signature?: string;
      listingId: number;
      isMock?: boolean;
    },
  ) {
    const keySecret = this.configService.get<string>("RAZORPAY_KEY_SECRET") || process.env.RAZORPAY_KEY_SECRET;
    const isMock = dto.isMock || !keySecret || keySecret.includes("change-me-to-your-razorpay-secret");

    if (!isMock) {
      if (!dto.signature) {
        throw new BadRequestException("Payment signature is required for verification");
      }
      const text = `${dto.orderId}|${dto.paymentId}`;
      const generatedSignature = crypto
        .createHmac("sha256", keySecret!)
        .update(text)
        .digest("hex");

      if (generatedSignature !== dto.signature) {
        this.logger.warn(`Marketplace signature verification failed for user ${userId}`);
        throw new BadRequestException("Invalid payment signature");
      }
    } else {
      this.logger.log(`Verified mock marketplace payment successfully for listing ${dto.listingId}, user ${userId}.`);
    }

    return {
      success: true,
      message: `Successfully purchased marketplace item ${dto.listingId}`,
      transactionId: dto.paymentId,
    };
  }
}
