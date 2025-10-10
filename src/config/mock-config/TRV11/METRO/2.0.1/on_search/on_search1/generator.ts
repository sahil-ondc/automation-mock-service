import { SessionData } from "../../../../session-types";
import { createFullfillment } from "../fullfillment-generator";
export function updateProviderTime(payload: any) {
  const now = new Date();
  const twoDaysLater = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);

  payload.message.catalog.providers.forEach((provider: any) => {
    if (provider.time && provider.time.range) {
      provider.time.range.start = now.toISOString();
      provider.time.range.end = twoDaysLater.toISOString();
    }
  });

  return payload;
}
function updatePaymentDetails(payload: any, sessionData: SessionData) {
  const providers = payload?.message?.catalog?.providers || [];

  providers.forEach((provider: any) => {
    const payments = provider?.payments || [];

    payments.forEach((payment: any) => {
      // Update collected_by
      payment.collected_by = sessionData.collected_by;

      // Update BUYER_FINDER_FEES_PERCENTAGE in tags
      const buyerFinderTag = payment.tags?.find(
        (tag: any) => tag.descriptor?.code === "BUYER_FINDER_FEES"
      );

      if (buyerFinderTag?.list) {
        const feeEntry = buyerFinderTag.list.find(
          (item: any) =>
            item.descriptor?.code === "BUYER_FINDER_FEES_PERCENTAGE"
        );

        if (feeEntry) {
          feeEntry.value = sessionData.buyer_app_fee;
        } else {
          // Add it if not present
          buyerFinderTag.list.push({
            descriptor: { code: "BUYER_FINDER_FEES_PERCENTAGE" },
            value: sessionData.buyer_app_fee,
          });
        }
      }
    });
  });

  return payload;
}
export async function onSearch1Generator(
  existingPayload: any,
  sessionData: any
) {
  existingPayload.message.catalog.providers[0].fulfillments =
    createFullfillment(sessionData.city_code).fulfillments;
  existingPayload = updatePaymentDetails(existingPayload, sessionData);
  existingPayload = updateProviderTime(existingPayload);
  return existingPayload;
}
