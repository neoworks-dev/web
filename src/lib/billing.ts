/**
 * Organization billing model.
 *
 * An organization is its own billable entity. Charges break down into:
 *  - Seats: the first {@link FREE_SEATS} members are free, each additional member
 *    costs {@link SEAT_PRICE_EUR} per month.
 *  - Storage: billed at cost (pass-through cloud pricing), metered monthly. Object
 *    visibility (public/private) is chosen per-upload via the API, not here.
 *  - Database usage: metered — query seconds, throughput, and storage amount/speed.
 *
 * Payment is handled by Mollie via `sdk.organizations.createPaymentSetup`, which
 * returns a hosted checkout URL that captures a reusable mandate. This module
 * stays free of SDK/browser imports so the pricing helpers remain unit-testable.
 */

/** Members included at no charge before per-seat billing applies. */
export const FREE_SEATS = 5;

/** Monthly price per seat beyond the free allowance, in euros. */
export const SEAT_PRICE_EUR = 15;

/** Monthly seat cost in euros for an organization with the given member count. */
export function seatCost(memberCount: number): number {
	const billableSeats = Math.max(0, memberCount - FREE_SEATS);
	return billableSeats * SEAT_PRICE_EUR;
}
