import {useEffect, useState} from 'react';
import type {Health, SearchItem, View} from '../domain/types';
import {useAccount} from '../hooks/useAccount';
import {useBasket} from '../hooks/useBasket';
import {useComparison} from '../hooks/useComparison';
import {useDemoAuth} from '../hooks/useDemoAuth';
import {useHistory} from '../hooks/useHistory';
import {usePantry} from '../hooks/usePantry';
import {useSavedLists} from '../hooks/useSavedLists';
import {useToast} from '../hooks/useToast';
import {getHealth, getTopDeals} from '../services/cartwiseApi';
import {PlanBuilder} from '../features/basket/PlanBuilder';
import {ComparisonView} from '../features/comparison/ComparisonView';
import {Dashboard} from '../features/dashboard/Dashboard';
import {ConfirmPurchaseModal} from '../features/history/ConfirmPurchaseModal';
import {HistoryView} from '../features/history/HistoryView';
import {ListsView} from '../features/lists/ListsView';
import {SaveListModal} from '../features/lists/SaveListModal';
import {PantryView} from '../features/pantry/PantryView';
import {PriceExplorer} from '../features/products/PriceExplorer';
import {ProfileView} from '../features/profile/ProfileView';
import {LoginScreen} from '../features/public/LoginScreen';
import {PublicLanding} from '../features/public/PublicLanding';
import {WebShell} from './WebShell';

export function WebApp() {
  const auth = useDemoAuth();
  const {toast, showToast} = useToast();
  const [view, setView] = useState<View>('dashboard');
  const [health, setHealth] = useState<Health | null>(null);
  const [healthError, setHealthError] = useState(false);
  const [topDeals, setTopDeals] = useState<SearchItem[]>([]);
  const [dealsError, setDealsError] = useState(false);
  const [bootstrapApiError, setBootstrapApiError] = useState<string | null>(null);
  const [showLogin, setShowLogin] = useState(false);

  const account = useAccount();
  const basket = useBasket(showToast);
  const comparison = useComparison(setView);
  const pantry = usePantry(showToast);
  const history = useHistory({
    basket: basket.basket,
    comparison: comparison.comparison,
    setBasket: (items) => basket.setBasket(items),
    compareItems: comparison.compareItems,
    setView,
    showToast,
    addItemsToPantry: pantry.addItemsToPantry,
  });
  const lists = useSavedLists({
    basket: basket.basket,
    setBasket: (items) => basket.setBasket(items),
    compareItems: comparison.compareItems,
    setView,
    showToast,
  });

  useEffect(() => {
    if (!auth.authed) return;
    getHealth()
      .then((data) => {
        setHealth(data);
        setHealthError(false);
      })
      .catch((error) => {
        setBootstrapApiError(error instanceof Error ? error.message : 'No pudimos cargar el estado del API.');
        setHealthError(true);
      });
    getTopDeals(8)
      .then((items) => {
        setTopDeals(items);
        setDealsError(false);
      })
      .catch(() => setDealsError(true));
  }, [auth.authed]);

  const compareBasket = () => comparison.compareItems(basket.basket);

  const logout = () => {
    auth.logout();
    setView('dashboard');
  };

  if (!auth.authed) {
    const enter = () => {
      auth.loginDemo();
      setShowLogin(false);
    };
    if (showLogin) {
      return <LoginScreen onLogin={enter} onBack={() => setShowLogin(false)} />;
    }
    return <PublicLanding onDemo={enter} onLogin={() => setShowLogin(true)} />;
  }

  return (
    <WebShell view={view} onNavigate={setView} onLogout={logout} basketCount={basket.basketUnits} toast={toast}>
      {(bootstrapApiError || comparison.apiError) && (
        <div className="cw-alert" role="alert">
          No pudimos cargar los precios en este momento. Vuelve a intentarlo en unos segundos.
        </div>
      )}
      {view === 'dashboard' && (
        <Dashboard
          health={health}
          healthError={healthError}
          basket={basket.basket}
          topDeals={topDeals}
          dealsError={dealsError}
          history={history.history}
          confirmed={history.confirmed}
          savedLists={lists.savedLists}
          pantry={pantry.pantry}
          budget={account.budget}
          onBudgetChange={account.setBudget}
          onNavigate={setView}
          onAdd={basket.addToBasket}
          onCompare={compareBasket}
          comparing={comparison.comparing}
        />
      )}
      {view === 'plan' && (
        <PlanBuilder
          basket={basket.basket}
          onAdd={basket.addToBasket}
          onQuantity={basket.updateQuantity}
          onRemove={basket.removeFromBasket}
          onSwitchToGeneric={basket.switchToGeneric}
          onClear={basket.clearBasket}
          onCompare={compareBasket}
          onSaveList={() => lists.setSavingList(true)}
          comparing={comparison.comparing}
        />
      )}
      {view === 'prices' && <PriceExplorer onAdd={basket.addToBasket} />}
      {view === 'lists' && (
        <ListsView
          lists={lists.savedLists}
          onRepeat={lists.repeatList}
          onCompare={lists.compareList}
          onRename={lists.renameList}
          onDelete={lists.deleteList}
          onNavigate={setView}
        />
      )}
      {view === 'comparison' && (
        <ComparisonView
          comparison={comparison.comparison}
          onBack={() => setView('plan')}
          onSave={history.savePlan}
        />
      )}
      {view === 'history' && (
        <HistoryView
          history={history.history}
          highlightedPlanId={history.highlightedPlanId}
          onRepeat={history.repeatPlan}
          onCompare={history.compareSavedPlan}
          onDelete={history.deletePlan}
          onClear={history.clearHistory}
          onStatusChange={history.updatePlanStatus}
          onConfirm={history.setConfirmingPlan}
          onSaveAsList={lists.savePlanAsList}
        />
      )}
      {view === 'pantry' && (
        <PantryView
          pantry={pantry.pantry}
          onAdd={pantry.addPantryItem}
          onQuantity={pantry.updatePantryQuantity}
          onConsume={pantry.consumePantryItem}
          onNavigate={setView}
        />
      )}
      {view === 'profile' && (
        <ProfileView
          account={account.account}
          onAccountChange={account.setAccount}
        />
      )}
      {history.confirmingPlan && (
        <ConfirmPurchaseModal
          plan={history.confirmingPlan}
          onClose={() => history.setConfirmingPlan(null)}
          onConfirm={history.confirmPurchase}
        />
      )}
      {lists.savingList && (
        <SaveListModal
          count={basket.basket.length}
          onClose={() => lists.setSavingList(false)}
          onSave={lists.saveCurrentAsList}
        />
      )}
    </WebShell>
  );
}
