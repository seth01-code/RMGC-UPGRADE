export default function getSubscriptionRoute(currency: string) {
  switch (currency) {
    case "USD":
      return "/payment/remoteWorker/subscribe/usd";
    case "GBP":
      return "/payment/remoteWorker/subscribe/gbp";
    case "EUR":
      return "/payment/remoteWorker/subscribe/eur";
    default:
      return "/payment/remoteWorker/subscribe/ngn";
  }
}
