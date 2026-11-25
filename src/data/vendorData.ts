export interface OrderItem {
  id: string;
  name: string;
  customization: string;
  quantity: string;
  price: number;
  image: string;
}

export interface VendorOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  address: string;
  time: string;
  date: string;
  totalAmount: number;
  paymentStatus: "Paid (Online)" | "Cash on Delivery" | "Paid (UPI)";
  status: "new" | "preparing" | "ready" | "completed" | "rejected";
  items: OrderItem[];
}

export const INITIAL_VENDOR_ORDERS: VendorOrder[] = [
  {
    id: "ord-1025",
    orderNumber: "#XC1025",
    customerName: "Rahul Kumar",
    phone: "+91 96524 93285",
    address: "H.No. 12-4-56, MG Road, Vijayawada - 520010",
    time: "8:30 PM",
    date: "Nov 24, 2026",
    totalAmount: 450,
    paymentStatus: "Paid (Online)",
    status: "new",
    items: [
      {
        id: "item-1",
        name: "Chicken Curry Cut",
        customization: "Medium pieces",
        quantity: "2 kg",
        price: 360,
        image: "https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=300&q=80",
      },
      {
        id: "item-2",
        name: "Chicken Biryani Cut",
        customization: "With bone",
        quantity: "1 kg",
        price: 90,
        image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=300&q=80",
      },
    ],
  },
  {
    id: "ord-1024",
    orderNumber: "#XC1024",
    customerName: "Priya Reddy",
    phone: "+91 98480 11223",
    address: "Flat 402, Sai Residency, Benz Circle, Vijayawada - 520010",
    time: "8:18 PM",
    date: "Nov 24, 2026",
    totalAmount: 320,
    paymentStatus: "Paid (Online)",
    status: "new",
    items: [
      {
        id: "item-3",
        name: "Tender Boneless Breast Fillet",
        customization: "Clean trimmed • No skin",
        quantity: "1.2 kg",
        price: 320,
        image: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=300&q=80",
      },
    ],
  },
  {
    id: "ord-1023",
    orderNumber: "#XC1023",
    customerName: "Vikas Sharma",
    phone: "+91 94401 55678",
    address: "Plot 88, Auto Nagar Main Rd, Vijayawada - 520007",
    time: "8:05 PM",
    date: "Nov 24, 2026",
    totalAmount: 780,
    paymentStatus: "Paid (UPI)",
    status: "new",
    items: [
      {
        id: "item-4",
        name: "Fresh Whole Chicken (Cleaned)",
        customization: "Tandoori slashes",
        quantity: "2 Birds (2.2kg)",
        price: 500,
        image: "https://images.unsplash.com/photo-1548865171-33a31485170d?auto=format&fit=crop&w=300&q=80",
      },
      {
        id: "item-5",
        name: "Plump Express Drumsticks",
        customization: "Bone-in skinless",
        quantity: "1 kg (8 pcs)",
        price: 280,
        image: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=300&q=80",
      },
    ],
  },
  {
    id: "ord-1022",
    orderNumber: "#XC1022",
    customerName: "Anil Kumar",
    phone: "+91 97000 44321",
    address: "D.No 5-21, Governorpet, Vijayawada - 520002",
    time: "7:52 PM",
    date: "Nov 24, 2026",
    totalAmount: 260,
    paymentStatus: "Paid (Online)",
    status: "new",
    items: [
      {
        id: "item-6",
        name: "Fresh Chicken Lollipop",
        customization: "Frenched wings (12 pcs)",
        quantity: "500g",
        price: 260,
        image: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=300&q=80",
      },
    ],
  },
  {
    id: "ord-1021",
    orderNumber: "#XC1021",
    customerName: "Sneha Das",
    phone: "+91 99887 76655",
    address: "Bhavanipuram 3rd Cross, Vijayawada - 520012",
    time: "7:40 PM",
    date: "Nov 24, 2026",
    totalAmount: 540,
    paymentStatus: "Paid (Online)",
    status: "new",
    items: [
      {
        id: "item-7",
        name: "Desi Naati / Country Chicken",
        customization: "Skin-on Curry Cut",
        quantity: "1.5 kg",
        price: 540,
        image: "https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=300&q=80",
      },
    ],
  },
  // Sample Preparing Orders
  {
    id: "ord-1020",
    orderNumber: "#XC1020",
    customerName: "Kiran Varma",
    phone: "+91 98499 22334",
    address: "Plot 12, Labbipet, Vijayawada",
    time: "7:25 PM",
    date: "Nov 24, 2026",
    totalAmount: 410,
    paymentStatus: "Paid (Online)",
    status: "preparing",
    items: [
      {
        id: "item-8",
        name: "Chicken Curry Cut (Skinless)",
        customization: "Medium pieces",
        quantity: "2 kg",
        price: 410,
        image: "https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=300&q=80",
      },
    ],
  },
  {
    id: "ord-1019",
    orderNumber: "#XC1019",
    customerName: "Meera Nair",
    phone: "+91 91234 56789",
    address: "Moghalrajpuram, Vijayawada",
    time: "7:10 PM",
    date: "Nov 24, 2026",
    totalAmount: 380,
    paymentStatus: "Paid (UPI)",
    status: "preparing",
    items: [
      {
        id: "item-9",
        name: "Store-Ground Chicken Keema",
        customization: "Fine mince",
        quantity: "1 kg",
        price: 380,
        image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=300&q=80",
      },
    ],
  },
  {
    id: "ord-1018",
    orderNumber: "#XC1018",
    customerName: "Deepak Rao",
    phone: "+91 93456 78901",
    address: "Gunadala Centre, Vijayawada",
    time: "6:55 PM",
    date: "Nov 24, 2026",
    totalAmount: 510,
    paymentStatus: "Paid (Online)",
    status: "preparing",
    items: [
      {
        id: "item-10",
        name: "Master Biryani Cut",
        customization: "Large Bone-in",
        quantity: "2 kg",
        price: 510,
        image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=300&q=80",
      },
    ],
  },
];
