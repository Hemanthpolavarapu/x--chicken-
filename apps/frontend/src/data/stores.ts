export interface StoreHub {
  id: string;
  name: string;
  area: string;
  city: string;
  pincodes: string[];
  avgDeliveryMins: number;
  status: "Open" | "Rush Hour" | "Closing Soon";
}

export const STORE_HUBS: StoreHub[] = [
  {
    id: "blr-ind",
    name: "X-Chicken Hub #01 (Indiranagar)",
    area: "Indiranagar 100ft Rd",
    city: "Bangalore",
    pincodes: ["560038", "560008", "560075", "560007"],
    avgDeliveryMins: 28,
    status: "Open",
  },
  {
    id: "blr-kor",
    name: "X-Chicken Hub #02 (Koramangala)",
    area: "Koramangala 4th Block",
    city: "Bangalore",
    pincodes: ["560034", "560095", "560047", "560029"],
    avgDeliveryMins: 32,
    status: "Open",
  },
  {
    id: "blr-hsp",
    name: "X-Chicken Hub #03 (HSR Layout)",
    area: "HSR Sector 1 & 2",
    city: "Bangalore",
    pincodes: ["560102", "560068", "560078"],
    avgDeliveryMins: 25,
    status: "Open",
  },
  {
    id: "blr-whf",
    name: "X-Chicken Hub #04 (Whitefield)",
    area: "Whitefield Main Rd",
    city: "Bangalore",
    pincodes: ["560066", "560087", "560048"],
    avgDeliveryMins: 35,
    status: "Open",
  },
];
