import { Route, Routes } from "react-router-dom";
import { AccountViewPage } from "./pages/AccountViewPage";
import { BuyingStoreIndexPage } from "./pages/BuyingStoreIndexPage";
import { BuyingStorePage } from "./pages/BuyingStorePage";
import { CastleIndexPage } from "./pages/CastleIndexPage";
import { CharacterViewPage } from "./pages/CharacterViewPage";
import { CharacterRankingPage } from "./pages/CharacterRankingPage";
import { CreateAccountPage } from "./pages/CreateAccountPage";
import { GuildRankingPage } from "./pages/GuildRankingPage";
import { GuildViewPage } from "./pages/GuildViewPage";
import { ItemIndexPage } from "./pages/ItemIndexPage";
import { ItemViewPage } from "./pages/ItemViewPage";
import { LegacyFluxLayout } from "./components/LegacyFluxLayout";
import { MonsterIndexPage } from "./pages/MonsterIndexPage";
import { MonsterViewPage } from "./pages/MonsterViewPage";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { NewsPage } from "./pages/NewsPage";
import { ServerInfoPage } from "./pages/ServerInfoPage";
import { ServerStatusPage } from "./pages/ServerStatusPage";
import { VendingIndexPage } from "./pages/VendingIndexPage";
import { VendingShopPage } from "./pages/VendingShopPage";
import { WoePage } from "./pages/WoePage";
import { NotFoundPage } from "./pages/NotFoundPage";

export function App() {
  return (
    <Routes>
      <Route element={<LegacyFluxLayout />}>
        <Route index element={<HomePage />} />
        <Route path="/main/index" element={<HomePage />} />
        <Route path="/news/index" element={<NewsPage />} />
        <Route path="/server/status" element={<ServerStatusPage />} />
        <Route path="/server/info" element={<ServerInfoPage />} />
        <Route path="/woe/index" element={<WoePage />} />
        <Route path="/castle/index" element={<CastleIndexPage />} />
        <Route path="/vending/index" element={<VendingIndexPage />} />
        <Route path="/vending/viewshop/:id" element={<VendingShopPage />} />
        <Route path="/buyingstore/index" element={<BuyingStoreIndexPage />} />
        <Route path="/buyingstore/viewshop/:id" element={<BuyingStorePage />} />
        <Route path="/account/login" element={<LoginPage />} />
        <Route path="/account/create" element={<CreateAccountPage />} />
        <Route path="/account/view" element={<AccountViewPage />} />
        <Route path="/character/view/:id" element={<CharacterViewPage />} />
        <Route path="/ranking/character" element={<CharacterRankingPage />} />
        <Route path="/ranking/guild" element={<GuildRankingPage />} />
        <Route path="/guild/view/:id" element={<GuildViewPage />} />
        <Route path="/item/index" element={<ItemIndexPage />} />
        <Route path="/item/view/:id" element={<ItemViewPage />} />
        <Route path="/monster/index" element={<MonsterIndexPage />} />
        <Route path="/monster/view/:id" element={<MonsterViewPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
