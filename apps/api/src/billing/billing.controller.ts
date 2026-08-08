import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { BillingService } from "./billing.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";

@ApiTags("Billing")
@ApiBearerAuth("JWT-auth")
@UseGuards(JwtAuthGuard)
@Controller("billing")
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post("subscription/create-order")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Create a Razorpay order for upgrading subscription" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        planId: { type: "string", example: "plus" },
      },
      required: ["planId"],
    },
  })
  @ApiResponse({ status: HttpStatus.OK, description: "Order created successfully" })
  async createOrder(
    @CurrentUser("user_id") userId: number,
    @Body("planId") planId: string,
  ) {
    return this.billingService.createOrder(userId, planId);
  }

  @Post("subscription/verify")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Verify payment signature and activate subscription" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        orderId: { type: "string" },
        paymentId: { type: "string" },
        signature: { type: "string" },
        planId: { type: "string" },
        isMock: { type: "boolean" },
      },
      required: ["orderId", "paymentId", "planId"],
    },
  })
  @ApiResponse({ status: HttpStatus.OK, description: "Payment verified and subscription activated" })
  async verifyPayment(
    @CurrentUser("user_id") userId: number,
    @Body()
    dto: {
      orderId: string;
      paymentId: string;
      signature?: string;
      planId: string;
      isMock?: boolean;
    },
  ) {
    return this.billingService.verifyPayment(userId, dto);
  }

  @Post("subscription/cancel")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Cancel active subscription" })
  @ApiResponse({ status: HttpStatus.OK, description: "Subscription cancelled" })
  async cancelSubscription(@CurrentUser("user_id") userId: number) {
    return this.billingService.cancelSubscription(userId);
  }
}
