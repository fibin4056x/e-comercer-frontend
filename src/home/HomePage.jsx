import { useContext } from "react";
import PremiumCatalogPage from "./content/catalog/PremiumCatalogPage";
import { Context as Logincontext } from "../registrationpage/loginpages/LogincontextV2";

export default function HomePage() {
  const { user } = useContext(Logincontext) || {};

  return (
    <PremiumCatalogPage
      title={`Welcome, ${user?.username || "Guest"}!`}
      subtitle="Discover the latest trends in footwear."
      searchPlaceholder="Search products..."
    />
  );
}
