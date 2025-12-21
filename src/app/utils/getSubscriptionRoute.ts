export default function getSubscriptionRoute(currency: string) {
  switch (currency) {
    case "USD":
      return "/payments/organization/subscribe/usd";
    case "GBP":
      return "/payments/organization/subscribe/gbp";
    case "EUR":
      return "/payments/organization/subscribe/eur";
    default:
      return "/payments/organization/subscribe/ngn";
  }
}
