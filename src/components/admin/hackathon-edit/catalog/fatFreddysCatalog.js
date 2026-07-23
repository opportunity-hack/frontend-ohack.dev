// Catalog seeded from Fat Freddy's Catering menu (October 2025 v2).
//
// Source: vendor PDFs at https://www.fatfreddyscatering.com
// Prices are per-person unless `unit` says otherwise. Per-person items have a
// 15-person minimum unless specified. Many entrees come bundled with mixed
// greens salad, fresh baked bread, and chef's daily desserts — those bundled
// sides are noted in `bundled_with` for the cost-summary view.
//
// Update freely as menus change. Items are matched/identified by `id` only;
// the rest of the fields are display data and can be edited safely.

export const FAT_FREDDYS_VENDOR = "Fat Freddy's Catering";

const ENTREE_BUNDLE_SALAD_BREAD_DESSERT = [
  "Mixed greens salad with dressing",
  "Fresh baked bread",
  "Chef's daily dessert selection",
];

const ENTREE_BUNDLE_BBQ = ["Two sides", "Sandwich buns or rolls", "Dessert"];

export const FAT_FREDDYS_CATALOG = [
  // ---- Breakfast ----
  {
    id: "ff-bf-sandwiches",
    category: "Breakfast",
    name: "Breakfast Sandwiches",
    description:
      "Choose one: English Muffin with Fried Egg, Shaved Black Forest Ham & Swiss; Croissant with Fried Egg, Spicy Sausage & Swiss; or Burrito with Scrambled Egg, Chorizo, Potatoes & Cheddar.",
    price_cents: 1250,
    unit: "per_person",
    min_quantity: 15,
    dietary_tags: [],
  },
  {
    id: "ff-bf-continental",
    category: "Breakfast",
    name: "Continental Breakfast",
    description:
      "Assortment of sweet breads, mini muffins, danish, fresh cut fruit, and regular and/or decaf coffee.",
    price_cents: 1050,
    unit: "per_person",
    min_quantity: 15,
    dietary_tags: ["vegetarian"],
  },
  {
    id: "ff-bf-deluxe-continental",
    category: "Breakfast",
    name: "Deluxe Continental Breakfast",
    description:
      "Sweet breads, mini muffins, danish, bagels with cream cheese, butter & jellies, fresh cut fruit, yogurt & granola, and coffee.",
    price_cents: 1600,
    unit: "per_person",
    min_quantity: 15,
    dietary_tags: ["vegetarian"],
  },
  {
    id: "ff-bf-cowboy",
    category: "Breakfast",
    name: "Cowboy Breakfast",
    description:
      "Buttermilk biscuits, country sausage gravy, scrambled eggs, bacon, and fresh cut fruit.",
    price_cents: 1600,
    unit: "per_person",
    min_quantity: 15,
    dietary_tags: [],
  },
  {
    id: "ff-bf-pancake",
    category: "Breakfast",
    name: "Pancake Breakfast",
    description:
      "Buttermilk pancakes with butter & warm maple syrup, scrambled eggs, breakfast sausage, and fresh cut fruit.",
    price_cents: 1600,
    unit: "per_person",
    min_quantity: 15,
    dietary_tags: [],
  },
  {
    id: "ff-bf-brunch-starter",
    category: "Breakfast",
    name: "Brunch Starter",
    description:
      "Breakfast egg strata, caramelized french toast with butter & warm maple syrup, fresh cut fruit.",
    price_cents: 1850,
    unit: "per_person",
    min_quantity: 15,
    dietary_tags: ["vegetarian"],
  },
  {
    id: "ff-bf-french-toast",
    category: "Breakfast",
    name: "Fat Freddy's French Toast",
    description:
      "Thick cut caramelized french toast with butter and warm maple syrup, scrambled eggs, breakfast sausage, and fresh cut fruit.",
    price_cents: 1600,
    unit: "per_person",
    min_quantity: 15,
    dietary_tags: [],
  },
  {
    id: "ff-bf-ultimate",
    category: "Breakfast",
    name: "Ultimate Breakfast",
    description:
      "Scrambled eggs, apple wood smoked bacon, potatoes O'Brien, sweet breads, mini muffins, danish, bagels with cream cheese, butter & jellies, individual yogurt parfaits with granola & fresh cut fruit.",
    price_cents: 1950,
    unit: "per_person",
    min_quantity: 15,
    dietary_tags: [],
  },
  {
    id: "ff-bf-tacos",
    category: "Breakfast",
    name: "Breakfast Tacos (GF)",
    description:
      "Scrambled eggs, shredded cheddar, salsa, breakfast potatoes, fresh cut fruit and sausage crumble. Served with warm corn tortillas.",
    price_cents: 1500,
    unit: "per_person",
    min_quantity: 15,
    dietary_tags: ["gluten-free"],
  },
  {
    id: "ff-bf-omelets",
    category: "Breakfast",
    name: "Omelets Made to Order",
    description:
      "Chef-prepared personalized omelets, plus a buffet with potatoes O'Brien, apple wood smoked bacon, fresh cut fruit, and assorted sweet breads. (*) Full-Service Events only — additional labor fees apply.",
    price_cents: 2500,
    unit: "per_person",
    min_quantity: 15,
    dietary_tags: [],
  },

  // ---- All American & BBQ entrees (bundled with salad, bread, dessert) ----
  {
    id: "ff-am-herb-roasted-chicken",
    category: "All American & BBQ",
    name: "Herb Roasted Chicken (GF)",
    description:
      "Fresh roasted bone-in chicken with our special blend of spices, served with red skin garlic mashed potatoes.",
    price_cents: 1750,
    unit: "per_person",
    min_quantity: 15,
    dietary_tags: ["gluten-free"],
    bundled_with: ENTREE_BUNDLE_SALAD_BREAD_DESSERT,
  },
  {
    id: "ff-am-yankee-pot-roast",
    category: "All American & BBQ",
    name: "Yankee Pot Roast",
    description:
      "Slow roasted eye of round with pearl onions, peas and carrots. Served with homestyle mashed potatoes and brown gravy.",
    price_cents: 1975,
    unit: "per_person",
    min_quantity: 15,
    dietary_tags: [],
    bundled_with: ENTREE_BUNDLE_SALAD_BREAD_DESSERT,
  },
  {
    id: "ff-am-meatloaf",
    category: "All American & BBQ",
    name: "Pan Fried Meatloaf",
    description:
      "75-year-old family recipe with beef and pork. Served with homestyle mashed potatoes and brown gravy.",
    price_cents: 1875,
    unit: "per_person",
    min_quantity: 15,
    dietary_tags: [],
    bundled_with: ENTREE_BUNDLE_SALAD_BREAD_DESSERT,
  },
  {
    id: "ff-am-southern-fried-chicken",
    category: "All American & BBQ",
    name: "Southern Style Fried Chicken",
    description:
      "Crispy bone-in chicken fried in our family's secret spices. Served with homestyle mashed potatoes and creamy pepper gravy.",
    price_cents: 1675,
    unit: "per_person",
    min_quantity: 15,
    dietary_tags: [],
    bundled_with: ENTREE_BUNDLE_SALAD_BREAD_DESSERT,
  },
  {
    id: "ff-am-burgers",
    category: "All American & BBQ",
    name: "1/3 Pound Angus All Beef Hamburgers",
    description:
      "Build-your-own condiment station: ketchup, mustard, mayo, American cheese slices, lettuce, tomato, pickle & onion. Gluten free buns at additional charge.",
    price_cents: 1600,
    unit: "per_person",
    min_quantity: 15,
    dietary_tags: [],
    bundled_with: ENTREE_BUNDLE_BBQ,
  },
  {
    id: "ff-am-bone-in-chicken",
    category: "All American & BBQ",
    name: "Bone-in Chicken Quarters (GF)",
    description: "Traditional sweet & smoky BBQ sauce.",
    price_cents: 1695,
    unit: "per_person",
    min_quantity: 15,
    dietary_tags: ["gluten-free"],
    bundled_with: ENTREE_BUNDLE_BBQ,
  },
  {
    id: "ff-am-hot-dogs",
    category: "All American & BBQ",
    name: "1/4 Pound All Beef Hot Dogs",
    description:
      "Build-your-own condiment station: ketchup, mustard, chopped onions, relish. Gluten free buns at additional charge.",
    price_cents: 1275,
    unit: "per_person",
    min_quantity: 15,
    dietary_tags: [],
    bundled_with: ENTREE_BUNDLE_BBQ,
  },
  {
    id: "ff-am-sloppy-joes",
    category: "All American & BBQ",
    name: "Old Fashioned Sloppy Joes",
    description: "Hearty classic with beef or turkey simmered in tangy house-made tomato sauce.",
    price_cents: 1275,
    unit: "per_person",
    min_quantity: 15,
    dietary_tags: [],
    bundled_with: ENTREE_BUNDLE_BBQ,
  },
  {
    id: "ff-am-pulled-pork",
    category: "All American & BBQ",
    name: "BBQ Pulled Pork",
    description: "Traditional sweet & smoky BBQ sauce. Gluten free buns at additional charge.",
    price_cents: 1775,
    unit: "per_person",
    min_quantity: 15,
    dietary_tags: [],
    bundled_with: ENTREE_BUNDLE_BBQ,
  },
  {
    id: "ff-am-pulled-chicken",
    category: "All American & BBQ",
    name: "BBQ Pulled Chicken",
    description: "Traditional sweet & smoky BBQ sauce. Gluten free buns at additional charge.",
    price_cents: 1775,
    unit: "per_person",
    min_quantity: 15,
    dietary_tags: [],
    bundled_with: ENTREE_BUNDLE_BBQ,
  },
  {
    id: "ff-am-brisket",
    category: "All American & BBQ",
    name: "BBQ Beef Brisket (GF)",
    description: "Cider glazed onions & BBQ au jus.",
    price_cents: 2175,
    unit: "per_person",
    min_quantity: 15,
    dietary_tags: ["gluten-free"],
    bundled_with: ENTREE_BUNDLE_BBQ,
  },
  {
    id: "ff-am-spare-ribs",
    category: "All American & BBQ",
    name: "BBQ Pork Spare Ribs (GF)",
    description: "Dry rubbed with our special blend of spices.",
    price_cents: 1900,
    unit: "per_person",
    min_quantity: 15,
    dietary_tags: ["gluten-free"],
    bundled_with: ENTREE_BUNDLE_BBQ,
  },
  {
    id: "ff-am-baby-back-ribs",
    category: "All American & BBQ",
    name: "BBQ Baby Back Ribs (GF)",
    description: "Dry rubbed with our special blend of spices.",
    price_cents: 2450,
    unit: "per_person",
    min_quantity: 15,
    dietary_tags: ["gluten-free"],
    bundled_with: ENTREE_BUNDLE_BBQ,
  },
  {
    id: "ff-am-baked-potato-bar",
    category: "All American & BBQ",
    name: "Baked Potato Bar",
    description:
      "Idaho baked potatoes with butter, sour cream, shredded cheddar, apple wood bacon, broccoli cheese sauce, sautéed mushrooms & green onions; mixed greens salad with fresh vegetables and dressing; fresh baked rolls & butter; cookies & brownies.",
    price_cents: 1450,
    unit: "per_person",
    min_quantity: 15,
    dietary_tags: ["vegetarian"],
  },

  // ---- International ----
  {
    id: "ff-int-garlic-chicken-dijon",
    category: "International",
    name: "Garlic Chicken Dijon",
    description:
      "Dijon-marinated and pan-fried chicken breast with pesto butter sauce, served with wild rice pilaf.",
    price_cents: 1950,
    unit: "per_person",
    min_quantity: 15,
    dietary_tags: [],
    bundled_with: ENTREE_BUNDLE_SALAD_BREAD_DESSERT,
  },
  {
    id: "ff-int-teriyaki-chicken",
    category: "International",
    name: "Teriyaki Chicken",
    description:
      "Wok tossed chicken slices with five spices and teriyaki sauce, served with basmati rice.",
    price_cents: 1900,
    unit: "per_person",
    min_quantity: 15,
    dietary_tags: [],
    bundled_with: ENTREE_BUNDLE_SALAD_BREAD_DESSERT,
  },
  {
    id: "ff-int-apricot-mango-chicken",
    category: "International",
    name: "Apricot Mango Chicken",
    description:
      "Freddy's award-winning jerk-rub marinated grilled chicken breast with apricot coulis, served with wild rice pilaf.",
    price_cents: 1950,
    unit: "per_person",
    min_quantity: 15,
    dietary_tags: [],
    bundled_with: ENTREE_BUNDLE_SALAD_BREAD_DESSERT,
  },
  {
    id: "ff-int-beef-stroganoff",
    category: "International",
    name: "Beef Stroganoff",
    description:
      "Tender beef in garlic-onion-sour cream-mushroom sauce, served with buttered egg noodles or homestyle mashed potatoes.",
    price_cents: 1975,
    unit: "per_person",
    min_quantity: 15,
    dietary_tags: [],
    bundled_with: ENTREE_BUNDLE_SALAD_BREAD_DESSERT,
  },
  {
    id: "ff-int-lemon-margarita-chicken",
    category: "International",
    name: "Lemon Margarita Chicken",
    description:
      "Charred lemon chicken breast with balsamic glazed tomatoes and fresh basil, served with rice pilaf.",
    price_cents: 1950,
    unit: "per_person",
    min_quantity: 15,
    dietary_tags: [],
    bundled_with: ENTREE_BUNDLE_SALAD_BREAD_DESSERT,
  },
  {
    id: "ff-int-white-burgundy-chicken",
    category: "International",
    name: "White Burgundy Chicken",
    description:
      "Chicken breast in white cream sauce with mushrooms, garlic, and shallots, served with red skin garlic mashed potatoes.",
    price_cents: 1950,
    unit: "per_person",
    min_quantity: 15,
    dietary_tags: [],
    bundled_with: ENTREE_BUNDLE_SALAD_BREAD_DESSERT,
  },

  // ---- Italian ----
  {
    id: "ff-it-white-cheddar-broccoli",
    category: "Italian",
    name: "White Cheddar Broccoli Bake",
    description:
      "Penne pasta with fresh broccoli, grilled pesto chicken, apple wood bacon and white cheddar cheese.",
    price_cents: 1575,
    unit: "per_person",
    min_quantity: 15,
    dietary_tags: [],
    bundled_with: ["Mixed greens salad", "Garlic breadsticks", "Chef's dessert"],
  },
  {
    id: "ff-it-chicken-penne-romano",
    category: "Italian",
    name: "Chicken Penne Romano",
    description:
      "Grilled sliced chicken breast, baby spinach and mushrooms tossed with penne, sun-dried tomatoes and a homemade white wine cream sauce.",
    price_cents: 1575,
    unit: "per_person",
    min_quantity: 15,
    dietary_tags: [],
    bundled_with: ["Mixed greens salad", "Garlic breadsticks", "Chef's dessert"],
  },
  {
    id: "ff-it-baked-ziti",
    category: "Italian",
    name: "Baked Ziti with Italian Sausage",
    description:
      "Classic ziti pasta with marinara, sweet Italian sausage, herbed ricotta and three cheese blend.",
    price_cents: 1575,
    unit: "per_person",
    min_quantity: 15,
    dietary_tags: [],
    bundled_with: ["Mixed greens salad", "Garlic breadsticks", "Chef's dessert"],
  },
  {
    id: "ff-it-baked-manicotti",
    category: "Italian",
    name: "Baked Manicotti",
    description:
      "Large pasta tubes stuffed with bolognese sauce, ricotta and mozzarella cheese.",
    price_cents: 1575,
    unit: "per_person",
    min_quantity: 15,
    dietary_tags: [],
    bundled_with: ["Mixed greens salad", "Garlic breadsticks", "Chef's dessert"],
  },
  {
    id: "ff-it-rosetta-parmesan",
    category: "Italian",
    name: "Chicken Rosetta Parmesan",
    description:
      "Hand breaded chicken breast with alfredo and marinara sauces, mozzarella and parmesan, served with pasta marinara.",
    price_cents: 1950,
    unit: "per_person",
    min_quantity: 15,
    dietary_tags: [],
    bundled_with: ["Mixed greens salad", "Garlic breadsticks", "Chef's dessert"],
  },
  {
    id: "ff-it-marsala",
    category: "Italian",
    name: "Chicken Marsala",
    description:
      "Sautéed chicken breast with pancetta bacon, mushrooms and marsala. Served with red skin garlic mashed potatoes.",
    price_cents: 1950,
    unit: "per_person",
    min_quantity: 15,
    dietary_tags: [],
    bundled_with: ["Mixed greens salad", "Garlic breadsticks", "Chef's dessert"],
  },
  {
    id: "ff-it-piccata",
    category: "Italian",
    name: "Chicken Piccata",
    description:
      "Pecorino and egg battered chicken breast with fresh thyme, lemon and caper butter, served with a side of pasta.",
    price_cents: 1950,
    unit: "per_person",
    min_quantity: 15,
    dietary_tags: [],
    bundled_with: ["Mixed greens salad", "Garlic breadsticks", "Chef's dessert"],
  },
  {
    id: "ff-it-spaghetti-bolognese",
    category: "Italian",
    name: "Spaghetti Bolognese",
    description: "Marinara sauce made with roasted pork and beef.",
    price_cents: 1575,
    unit: "per_person",
    min_quantity: 15,
    dietary_tags: [],
    bundled_with: ["Mixed greens salad", "Garlic breadsticks", "Chef's dessert"],
  },
  {
    id: "ff-it-rigatoni-pesto-primavera",
    category: "Italian",
    name: "Rigatoni Pesto Primavera (V)",
    description:
      "Sweet bell peppers, cauliflower, zucchini and mushrooms in a creamy pesto alfredo sauce.",
    price_cents: 1675,
    unit: "per_person",
    min_quantity: 15,
    dietary_tags: ["vegetarian"],
    bundled_with: ["Mixed greens salad", "Garlic breadsticks", "Chef's dessert"],
  },
  {
    id: "ff-it-grilled-pesto-chicken",
    category: "Italian",
    name: "Grilled Pesto Chicken (GF)",
    description:
      "Grilled chicken breast smothered in homemade pesto sauce, topped with tomato slices and mozzarella, served with pasta. (Chicken is GF.)",
    price_cents: 1950,
    unit: "per_person",
    min_quantity: 15,
    dietary_tags: ["gluten-free"],
    bundled_with: ["Mixed greens salad", "Garlic breadsticks", "Chef's dessert"],
  },

  // ---- Hors d'Oeuvre Packages ----
  {
    id: "ff-ho-italian-package",
    category: "Hors d'Oeuvre Packages",
    name: "Italian Hors d'Oeuvre Package",
    description:
      "Antipasto display, fruit skewers, goat cheese bruschetta, flatbread with sausage, spinach & artichoke dip, portabella empanada, sicilian arancini bolognese, italian dessert assortment.",
    price_cents: 4450,
    unit: "per_person",
    min_quantity: 25,
    dietary_tags: [],
  },
  {
    id: "ff-ho-southwest-package",
    category: "Hors d'Oeuvre Packages",
    name: "Southwest Hors d'Oeuvre Package",
    description:
      "Tortilla chips & salsa, fruit tray, vegetable & bean empanadas, spinach & artichoke crisps, beef taquitos, smoked turkey carving station, southwest dessert display.",
    price_cents: 3150,
    unit: "per_person",
    min_quantity: 25,
    dietary_tags: [],
  },
  {
    id: "ff-ho-traditional-package",
    category: "Hors d'Oeuvre Packages",
    name: "Traditional Hors d'Oeuvre Package",
    description:
      "Cheese tray, fruit tray, vegetable crudites, raspberry chipotle meatballs, mini hot dogs in puff pastry, mini beef wellington, teriyaki chicken skewers, brownies & bar cookies.",
    price_cents: 3250,
    unit: "per_person",
    min_quantity: 25,
    dietary_tags: [],
  },
  {
    id: "ff-ho-continental-package",
    category: "Hors d'Oeuvre Packages",
    name: "Continental Hors d'Oeuvre Package",
    description:
      "Beef tenderloin carving station, smoked salmon, imported cheese, fruit skewers, vegetable crudites, lobster & brie phyllo, portabella empanada, arancini, miniature dessert assortment.",
    price_cents: 5550,
    unit: "per_person",
    min_quantity: 25,
    dietary_tags: [],
  },
  {
    id: "ff-ho-passed-2",
    category: "Hors d'Oeuvre Packages",
    name: "Passed Appetizers — Choose 2",
    description: "Pick any 2 passed appetizers (full-service events only).",
    price_cents: 850,
    unit: "per_person",
    min_quantity: 15,
    dietary_tags: [],
  },
  {
    id: "ff-ho-passed-3",
    category: "Hors d'Oeuvre Packages",
    name: "Passed Appetizers — Choose 3",
    description: "Pick any 3 passed appetizers (full-service events only).",
    price_cents: 1100,
    unit: "per_person",
    min_quantity: 15,
    dietary_tags: [],
  },

  // ---- A la carte hors d'oeuvres (per-person, common $4.50) ----
  { id: "ff-ala-nashville-hot-chicken-waffle", category: "A la carte appetizers", name: "Nashville Hot Chicken & Waffle Skewer", price_cents: 450, unit: "per_person", min_quantity: 15, dietary_tags: [] },
  { id: "ff-ala-sesame-chicken-tenders", category: "A la carte appetizers", name: "Sesame Chicken Tenders", description: "with sweet thai chili sauce", price_cents: 450, unit: "per_person", min_quantity: 15, dietary_tags: [] },
  { id: "ff-ala-chicken-skewers", category: "A la carte appetizers", name: "Chicken Skewers", description: "Thai peanut, teriyaki, or BBQ", price_cents: 450, unit: "per_person", min_quantity: 15, dietary_tags: [] },
  { id: "ff-ala-chicken-taquitos", category: "A la carte appetizers", name: "Chicken Taquitos", description: "with southwest ranch dipping sauce", price_cents: 450, unit: "per_person", min_quantity: 15, dietary_tags: [] },
  { id: "ff-ala-buffalo-chicken-tortilla-crisp", category: "A la carte appetizers", name: "Buffalo Chicken Tortilla Crisp", price_cents: 450, unit: "per_person", min_quantity: 15, dietary_tags: [] },
  { id: "ff-ala-italian-sausage-stuffed-mushrooms", category: "A la carte appetizers", name: "Italian Sausage Stuffed Mushrooms", description: "with asiago cheese", price_cents: 450, unit: "per_person", min_quantity: 15, dietary_tags: [] },
  { id: "ff-ala-mini-cuban-sandwiches", category: "A la carte appetizers", name: "Mini Cuban Sandwiches", price_cents: 450, unit: "per_person", min_quantity: 15, dietary_tags: [] },
  { id: "ff-ala-pulled-pork-mango-flauta", category: "A la carte appetizers", name: "Pulled Pork & Mango Flauta", description: "with southwest ranch dipping sauce", price_cents: 450, unit: "per_person", min_quantity: 15, dietary_tags: [] },
  { id: "ff-ala-mini-crab-cake", category: "A la carte appetizers", name: "Mini Crab Cake", description: "with remoulade sauce", price_cents: 500, unit: "per_person", min_quantity: 15, dietary_tags: [] },
  { id: "ff-ala-crab-cheese-rangoons", category: "A la carte appetizers", name: "Crab & Cheese Rangoons", price_cents: 500, unit: "per_person", min_quantity: 15, dietary_tags: [] },
  { id: "ff-ala-iced-jumbo-shrimp", category: "A la carte appetizers", name: "Iced Jumbo Shrimp Cocktail", description: "13/15 count", price_cents: 500, unit: "each", dietary_tags: ["pescatarian"] },
  { id: "ff-ala-vegetable-spring-roll", category: "A la carte appetizers", name: "Vegetable Spring Roll", description: "with sweet thai chili sauce", price_cents: 450, unit: "per_person", min_quantity: 15, dietary_tags: ["vegetarian"] },
  { id: "ff-ala-spinach-pesto-puffs", category: "A la carte appetizers", name: "Spinach Pesto Puffs", price_cents: 450, unit: "per_person", min_quantity: 15, dietary_tags: ["vegetarian"] },
  { id: "ff-ala-deviled-eggs", category: "A la carte appetizers", name: "Gourmet Deviled Eggs", price_cents: 450, unit: "per_person", min_quantity: 15, dietary_tags: ["vegetarian"] },
  { id: "ff-ala-mac-cheese-bites", category: "A la carte appetizers", name: "Macaroni & Cheese Bites", description: "with chipotle ranch dipping sauce", price_cents: 450, unit: "per_person", min_quantity: 15, dietary_tags: ["vegetarian"] },
  { id: "ff-ala-antipasto-skewers", category: "A la carte appetizers", name: "Antipasto Skewers", price_cents: 450, unit: "per_person", min_quantity: 15, dietary_tags: [] },

  // ---- Gourmet displays ----
  { id: "ff-disp-domestic-cheese", category: "Gourmet Displays", name: "Domestic Cheese Display", description: "with assorted crackers", price_cents: 450, unit: "per_person", min_quantity: 15, dietary_tags: ["vegetarian"] },
  { id: "ff-disp-imported-cheese", category: "Gourmet Displays", name: "Imported Cheese Display", price_cents: 550, unit: "per_person", min_quantity: 15, dietary_tags: ["vegetarian"] },
  { id: "ff-disp-fruit-cheese", category: "Gourmet Displays", name: "Fresh Fruit & Cheese Display", price_cents: 550, unit: "per_person", min_quantity: 15, dietary_tags: ["vegetarian"] },
  { id: "ff-disp-fruit", category: "Gourmet Displays", name: "Fresh Cut Fruit Display", description: "with poppy seed drizzle", price_cents: 450, unit: "per_person", min_quantity: 15, dietary_tags: ["vegan"] },
  { id: "ff-disp-veg-crudite", category: "Gourmet Displays", name: "Traditional Vegetable Crudite Display", description: "with pesto ranch dipping sauce", price_cents: 450, unit: "per_person", min_quantity: 15, dietary_tags: ["vegetarian"] },
  { id: "ff-disp-baked-brie", category: "Gourmet Displays", name: "Baked Brie with Apricot Preserves", price_cents: 625, unit: "per_person", min_quantity: 15, dietary_tags: ["vegetarian"] },
  { id: "ff-disp-italian-meat-cheese", category: "Gourmet Displays", name: "Italian Meat & Cheese Display", description: "Imported Italian meats and cheeses with focaccia, breadsticks, olives, peppers, artichokes and mushrooms.", price_cents: 1650, unit: "per_person", min_quantity: 15, dietary_tags: [] },
  { id: "ff-disp-smoked-salmon", category: "Gourmet Displays", name: "Whole Smoked Salmon", description: "Hickory smoked Pacific salmon on pickled onion, fennel and cucumber slaw with sliced baguette and crostini.", price_cents: 1550, unit: "per_person", min_quantity: 15, dietary_tags: ["pescatarian"] },
  { id: "ff-disp-grazing-board", category: "Gourmet Displays", name: "Grazing Board", description: "Assorted nuts, fruit spreads, berries, dried fruits, hard cheeses, salami, mortadella & pates with grissini sticks and crackers.", price_cents: 1950, unit: "per_person", min_quantity: 15, dietary_tags: [] },

  // ---- Equipment / extras ----
  {
    id: "ff-equip-chafing-dish",
    category: "Equipment & extras",
    name: "Chafing Dish Kit",
    description: "Per-pan chafing setup for keeping food warm.",
    price_cents: 1750,
    unit: "each",
    dietary_tags: [],
  },
];

// Export categories in display order for filter UIs.
export const FAT_FREDDYS_CATEGORIES = [
  "Breakfast",
  "All American & BBQ",
  "International",
  "Italian",
  "Hors d'Oeuvre Packages",
  "A la carte appetizers",
  "Gourmet Displays",
  "Equipment & extras",
];
