import { SessionData } from "../../../session-types";

const generateRandomId = () => {
	return Math.random().toString(36).substring(2, 15);
};

const transformPayments = (payments: any) => {
	return payments.map((payment: any) => {
		const tags = JSON.parse(JSON.stringify(payment.tags));

		const settlementTermsTag = tags.find(
			(tag: any) => tag.descriptor?.code === "SETTLEMENT_TERMS"
		);

		if (settlementTermsTag && Array.isArray(settlementTermsTag.list)) {
			settlementTermsTag.list.push(
				{
					descriptor: { code: "SETTLEMENT_WINDOW" },
					value: "P30D",
				},
				{
					descriptor: { code: "SETTLEMENT_BASIS" },
					value: "INVOICE_RECEIPT",
				}
			);
		}

		return {
			id: generateRandomId(),
			collected_by: payment.collected_by,
			status: "NOT-PAID",
			type: "PRE-ORDER",
			params: {
				bank_code: "XXXXXXXX",
				bank_account_number: "xxxxxxxxxxxxxx",
			},
			tags,
		};
	});
};
export async function onInitGenerator(
	existingPayload: any,
	sessionData: SessionData
) {
	const payments = transformPayments(sessionData.payments)
	existingPayload.message.order.payments = payments;
	if (sessionData.items.length > 0) {
		existingPayload.message.order.items = sessionData.items;
	}
	if (sessionData.fulfillments.length > 0) {
	existingPayload.message.order.fulfillments = sessionData.fulfillments;
	}
	if(sessionData.quote != null){
	existingPayload.message.order.quote = sessionData.quote
	}
	return existingPayload;
}
