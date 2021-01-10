import { ISearchCoupons } from "./ISearch";
export interface ISearchCategory {
    name: string;
    code: string;
    categoryCode: string;
    categoryName: string;
    category: string;
}
export interface ISearchImage {
    url: string;
    perspective: string;
    size: string;
}
export interface ISearchDetailsProduct {
    brandName?: string;
    clickListItem: boolean;
    countryOfOrigin?: string;
    customerFacingSize: string;
    description: string;
    homeDeliveryItem: boolean;
    images: ISearchImage[];
    mainImagePerspective: string;
    multipackItem: boolean;
    multipackQuantity: string;
    seoDescription: string;
    shipToHomeItem: boolean;
    soldInStore: boolean;
    temperatureIndicator: string;
    verified: boolean;
    mainImage: string;
    slug: string;
    categories: ISearchCategory[];
    calculatedRegularPrice: string;
    displayTemplate: string;
    division: string;
    orderBy: string;
    regularNFor: string;
    referenceNFor: string;
    store: string;
    priceNormal: string;
    promoDescription: string;
    soldBy: string;
    upc: string;
    hasPrice: boolean;
    loyalMember: boolean;
    curbsidePickupEligible: boolean;
}
export default interface ISearchDetails {
    products: ISearchDetailsProduct[];
    coupons: ISearchCoupons;
    priceHasError: boolean;
    totalCount: number;
}
