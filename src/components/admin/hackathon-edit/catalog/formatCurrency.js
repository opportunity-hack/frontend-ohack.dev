export const dollars = (cents) => (cents == null ? 0 : cents / 100);

export const formatUSD = (cents) => {
  if (cents == null || isNaN(cents)) return "—";
  return `$${(cents / 100).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const formatUSDCompact = (cents) => {
  if (cents == null || isNaN(cents)) return "—";
  const d = cents / 100;
  if (d >= 1000) return `$${d.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  return `$${d.toFixed(2)}`;
};

// Compute the per-item cost given a headcount. `each` items use a fixed qty
// stored on the item; `per_person` items use the meal's headcount.
export const computeItemCostCents = (item, headcount) => {
  if (!item || !item.price_cents) return 0;
  const unit = item.unit || "per_person";
  if (unit === "per_person") return Math.round(item.price_cents * Math.max(0, headcount || 0));
  if (unit === "each") return Math.round(item.price_cents * Math.max(0, item.quantity || 1));
  if (unit === "fixed") return item.price_cents;
  return 0;
};

export const computeMealCostCents = (meal, headcount) => {
  if (!meal || !Array.isArray(meal.items)) return 0;
  const overriden = meal.headcount_override;
  const effective = overriden != null && overriden !== "" ? Number(overriden) : headcount;
  return meal.items.reduce((sum, it) => sum + computeItemCostCents(it, effective), 0);
};

export const computeAllMealsCostCents = (meals, headcount) => {
  if (!Array.isArray(meals)) return 0;
  return meals.reduce((sum, m) => sum + computeMealCostCents(m, headcount), 0);
};
