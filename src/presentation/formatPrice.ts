import type {Price} from "../domain/gameDetails";

const euros = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });

export function formatPrice(price: Price): string {
    switch (price.kind) {
        case "free":
            return "Gratuit";
        case "paid": {
            const amount = euros.format(price.finalCents / 100);
            return price.discountPercent > 0
                ? `${amount} (-${price.discountPercent} %)`
                : amount;
        }
        case "unknown":
            return "Prix indisponible";
    }
}