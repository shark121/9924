export type ProductCategory = "polo" | "track_suit" | "rugby_shirt";

export type Product = {
  id: string;
  sku: string;
  name: string;
  price: number;
  description: string;
  images: string[];
  sizes: string[];
  category: ProductCategory;
  collection: string;
};

// image URLs reused as shorthand
const IMG = {
  stealth:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAk4IjhRJLlDKWt28tOd643U7VyFm03NkVs2K4W2au1VlH7SVWUc7v5VK8CBfWSPsBjztHs1z94o42s979-4AM6tn7_IwpA2OtLAYJhUtKcyDHP5mrSTY6Nt86UdpFvfN7LdcyYUjwvIoifyDAQ4xxXEeCtBY7YUZHmogAwqkS5s36Pq4TpuGzzwu3vRYYkfu9XRyrgBvqXjjQfhw8F56W5aZO5GqsL5hsTtlW2o2eY3dfzIrXa2uVX1QSraame49kFlM-eYWDtTk4",
  clinical:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuApig2kYLFS4AwgsqXXjrgpyxQZS9ynLOz06mCZUah9Wn9hhcTQR-wxfn68qTF62Qs-N2M_FUZz2JRXuzDkEavEWOrZlF2x2pYzKeVi9UAltfHh_7d_tOz-uwhm6tLHHaNjGJYJ2b9Rp1GyUoPoFGlr-dkdj_svYuy0yEbZyRucsgmNkEm0YLIHsC3Hv8q72CXg8pk7zhDhJpqnVp0b0WDGGIMy8xYDHeelzrtoSE9xLSEnxd-Keg9URLSFM4j_6BzqxDRmPXiC3nQ",
  concrete:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDlYUtt4hOkLJRZa5hqdtaUjFEqNJCF8ffa0HGzVHPFgf50zwpyc2lZYL0Du9ioGinekMOw5yO_wsoK8fColQXKkTBTpXiy3gAQW_GTnQQLG6HBQIkO5HBwTXtyBint1MkeabJbsZxv0nPmzH9-pFm3MdZPaT55ANe0Cxu9D_Ng9EF4geDBQuAPgUOoo-k5KSH0BWbu-SO43lpvAKKFzOwAhNumGvxl2cDa6TDQ0V3EalToybmDg7FAjhSjMIo_62zkQYBx6MZSaP0",
  signal:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBOGwgXmGc74qpadI3xkzcjJI7sp0qBGRXuTyBPVaEExVnj2cXBVd3nQq4dG0Jz_4aWptI_JehGHsG29MAPjfrWF_pMiKDtYlZENQgTblh0Mj5FaYQtHj2hRQgEwcpV--Sdpc1AZOyKflfJK8l5kAnD_7oL-5iTEnfzey6pJTqUVYyDZxjSXvZWyGBoFZiFwP7tQwgnw-NSuBvSaSmbrpVD4FnQdyMjxl5SQrKyPLazUNmwHFT9BzcK2LzcKWdsU0neOOgCx2OLJB8",
  obsidian:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCq9mNqjopzApZNlh0QoGWC9T0HigsEgCuJgOu58MlvYKog7sqgOLzVgZRBtStZPXhFd02hudyICYmJR5kfepYCbexda76b4prNoNhwVIfBDbcNIJB-cYmw_eP9-qPhA_E3aCGTe2ME6qjEWbNkXS_Md0TFvslhiIIVmZL2Zw_VaT1g4wmakL9_3kHgwDcxZJq0SxCuP6rwvxvS06_yEEGNYafX0Kv3oQI_D40-6n3Ga1K5PxrPX-85aG9t0i0MZ7_2CFWXR4VfpVc",
  field:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDeVfFTFy9BnJatI-Vd5czkY_Ae5oPMvVgXsXCGwf95eIuwgoZjQFPhbP0-lRIYhaMQAmpV8MuQkGvRuM_A3i6_Gc_g12hXMrZfbQKyf2Dle3jczIGJJJ7W7RO39w3NAl1BfBZryNJ7xUBFCpO4aOK0ue6AwNZRA0gvfSNQXQecqlKecmDkwpTC5BWY-zd_QUtF1CJa8oOeU09AmSyBWzwEHUkEdL6NIJ73cTynzYpkGruXTZyeEiohC9Ok9D8-6VC3mm-jnQkXybQ",
  abyss:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDyWyqUV7hnLqVJNbuy0OCIDYa6rggOt0VUicaWqz4wf0U0YjI4aGcm-PmeJUJ3uP4tSKyThVZC9F2i8FOEPVUc9Rm-JAINEeqT6kkupWWP2NcK99XQO8AGIF97Y0h5A6npZdOdnk96trJrEyJV6yEAX09q5XQ_OXYTu8BvGqyiC9fdSDFbum4EbWu80_M06vCeUxXt43nAMXN5735jyQI1drL3P1iWq0ymVwfLDm_uGCD-Gn2TiZv2qyBUCyVMKW7r_9_NXQifJYY",
  prototype:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAAEjBgTjt93Zp-LIIxchIaq78Mloz7qIRq5dYnARnXoJlQdw7dR2HKasqBUemw2L2Y78HHlhlWEwb9Zeo8AB5CpmtajUyJBnRs5SoD6Hmq611MCJ196SUZCehr2IbHIpokE_3nsgbpQ7k5ldTogbk9mzYQjSIaO6vkAyfHnL6lLUXIw5mmFHizuPhcmGQtC-B4BC3v-QbGZ0iOLopVnenduEqODY3J5ZygYV4KhP4O1wZJJnPUhXuZD5BfmD12ycpw8aU2F20DSuo",
  white_front: "/products/9924 polo Jerseys front.jpg.jpeg",
  white_back: "/products/Back 9924.jpg.jpeg",
  black_back: "/products/9924 Jerseys black back.jpg.jpeg",
  black_front: "/products/9924 Jerseys front black .jpg.jpeg",
};

export const products: Product[] = [
  {
    id: "prod_01",
    sku: "0101-BLK-24",
    name: "PG-01 / GOLD COAST",
    price: 70,
    description:
      "Inspired by home, worn everywhere. A collectible football polo representing movement, identity and culture.",
    images: [IMG.white_front, IMG.white_back],
    sizes: ["S", "M", "L", "XL"],
    category: "polo",
    collection: "REPUBLIC_SERIES",
  },
  {
    id: "prod_02",
    sku: "0102-WHT-24",
    name: "PG-02 / GOLD COAST",
    price: 70,
    description:
      "Clinical white low-profile silhouette. Transparent polymer accent panels. Technical speed-lacing system with heat-bonded overlays.",
    images: [IMG.black_front, IMG.black_back],
    sizes: ["S", "M", "L", "XL"],
    category: "polo",
    collection: "REPUBLIC_SERIES",
  },
  // {
  //   id: "prod_03",
  //   sku: "0103-GRY-24",
  //   name: "YS-01 / CONCRETE",
  //   price: 445,
  //   description:
  //     "Concrete grey industrial build with reflective silver panelling. Rugged lug outsole for urban terrain navigation. Carbon reinforced heel cup.",
  //   images: [IMG.concrete, IMG.abyss, IMG.stealth],
  //   sizes: ["7", "8", "9", "10", "11", "12"],
  //   category: "off_road_v1",
  //   collection: "YS-01",
  // },
  // {
  //   id: "prod_04",
  //   sku: "0104-ORN-24",
  //   name: "YS-01 / SIGNAL",
  //   price: 480,
  //   description:
  //     "Orange tactical highlight colorway on semi-translucent ripstop upper. High-vis emergency orange accent stripe. Engineered for rapid identification.",
  //   images: [IMG.signal, IMG.field, IMG.obsidian],
  //   sizes: ["7", "8", "9", "10", "11", "12"],
  //   category: "off_road_v1",
  //   collection: "YS-01",
  // },
  // {
  //   id: "prod_05",
  //   sku: "0105-OB-24",
  //   name: "YS-01 / OBSIDIAN",
  //   price: 420,
  //   description:
  //     "Deep obsidian black technical silhouette with heavy-duty lug tread. Matte finish coated upper. Architectural heel counter. Zero-light absorption profile.",
  //   images: [IMG.obsidian, IMG.stealth, IMG.field],
  //   sizes: ["7", "8", "9", "10", "11", "12"],
  //   category: "stretch_knit",
  //   collection: "YS-01",
  // },
  // {
  //   id: "prod_06",
  //   sku: "0106-OD-24",
  //   name: "YS-01 / FIELD",
  //   price: 460,
  //   description:
  //     "Olive drab military-spec ripstop fabric construction. Carbon fiber lateral support structures. Multi-terrain lug pattern. Mission-ready build quality.",
  //   images: [IMG.field, IMG.signal, IMG.concrete],
  //   sizes: ["7", "8", "9", "10", "11", "12"],
  //   category: "off_road_v1",
  //   collection: "YS-01",
  // },
  // {
  //   id: "prod_07",
  //   sku: "0107-NY-24",
  //   name: "YS-01 / ABYSS",
  //   price: 435,
  //   description:
  //     "Navy blue technical upper with contrasting cyan detail work. Speed-lacing mechanism with polymer lock. Deep-water inspired industrial aesthetic.",
  //   images: [IMG.abyss, IMG.clinical, IMG.prototype],
  //   sizes: ["7", "8", "9", "10", "11", "12"],
  //   category: "stretch_knit",
  //   collection: "YS-01",
  // },
  // {
  //   id: "prod_08",
  //   sku: "0108-PX-24",
  //   name: "YS-01 / PROTOTYPE",
  //   price: 510,
  //   description:
  //     "Silver-white experimental form with exposed internal mechanics and aerodynamic upper profile. Clinical aesthetic. Pre-production colourway. Limited deployment.",
  //   images: [IMG.prototype, IMG.clinical, IMG.signal],
  //   sizes: ["7", "8", "9", "10", "11", "12"],
  //   category: "core_struct",
  //   collection: "YS-01",
  // },
];

// derived helpers
export const collections = [...new Set(products.map((p) => p.collection))];

export const productsByCollection = collections.reduce<
  Record<string, Product[]>
>((acc, col) => {
  acc[col] = products.filter((p) => p.collection === col);
  return acc;
}, {});
