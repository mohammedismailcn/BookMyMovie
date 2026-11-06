// Presentation-only promotions. No bank/provider validation or checkout discounts.
export const homeOffers = [
  { id: "bank", is_active: true, badge: "Weekend special", expiry: "Sample offer", title: "Buy 1 Get 1 Free with HDFC Bank Cards", description: "A little more cinema, a little less spend. Preview a card offer for your next movie night.", code: "BMMHDFC", type: "bank" },
  { id: "food", is_active: true, badge: "Gourmet combo", expiry: "Sample offer", title: "25% Off Truffle Popcorn & Beverages", description: "Make it a movie-and-popcorn kind of evening. Preview a combo offer to complete the experience.", code: "MUNCH25", type: "food" },
] as const;
