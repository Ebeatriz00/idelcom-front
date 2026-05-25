import { Navigate, Route, Routes } from "react-router-dom";

import {
  Account,
  AccountPlan,
  Accounts,
  Area,
  AssignmentTypePage,
  AttendanceMatrix,
  Bank,
  Boxes,
  Brands,
  Categories,
  CommercialParameters,
  Company,
  ConceptGroups,
  Concepts,
  ConfigSettings,
  Construction,
  Contacts,
  ContactType,
  CostCenters,
  Currency,
  DetailOpportunity,
  DetailQuotes,
  Documents,
  DocumentTypeView,
  ExchangeRate,
  ExerPer,
  Hiring,
  JobTitle,
  LinesView,
  Modules,
  ModulesPermissions,
  MovementsPage,
  MovementTypes,
  NotificationsPage,
  Opportunity,
  Orders,
  ParentModules,
  PermissionsView,
  PersonnelHomologationPage,
  PreSaleProyects,
  PreSaleProyectsDetail,
  ProcessPage,
  ProcessView,
  ProductLines,
  Products,
  ProductTypes,
  Profiles,
  ProfilesPermissions,
  ProfilesSettings,
  Qualifications,
  Quotes,
  RequirementPage,
  Series,
  SourcesView,
  SsomaDocumentTypePage,
  StatesView,
  StatusView,
  PurchaseOrderDetail,
  PurchaseOrders,
  Suppliers,
  SupportPage,
  Tasks,
  TasksProject,
  TaxAffType,
  Uom,
  UsersModules,
  Viability,
  Warehouses,
  WorkerView,
} from "@/pages";
import ClientsDetailPage from "@/pages/crm/accounts/components/modal/ClientsDetailPage";
import { CommercialDashboard } from "@/pages/Dashboard/components/Commercial/DashboardCommercial";
import { PreSalesDashboard } from "@/pages/Dashboard/components/PreSales/DashboardPreSales";
import { DashboardPage } from "@/pages/Dashboard/Dashboard";
import ProjectTasksPage from "@/pages/presale/presaleproyects/components/ProjectTaskPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route path="/dashboard" element={<DashboardPage />} />

      <Route path="/dashboard/comercial" element={<CommercialDashboard />} />
      <Route path="/dashboard/PreSale" element={<PreSalesDashboard />} />
      <Route path="/config/Company" element={<Company />} />
      <Route path="/config/Profiles" element={<Profiles />} />
      <Route path="/config/ParentModules" element={<ParentModules />} />
      <Route path="/config/Modules" element={<Modules />} />
      <Route
        path="/config/PermissionsModules"
        element={<ModulesPermissions />}
      />
      <Route path="/config/Permissions" element={<PermissionsView />} />
      <Route
        path="/config/ProfilesPermissions"
        element={<ProfilesPermissions />}
      />
      <Route path="/config/Users" element={<UsersModules />} />
      <Route path="/rrhh/Area" element={<Area />} />
      <Route path="/rrhh/JobTitle" element={<JobTitle />} />
      <Route path="/general/DocumentType" element={<DocumentTypeView />} />
      <Route path="/rrhh/Worker" element={<WorkerView />} />
      <Route path="/general/Currency" element={<Currency />} />
      <Route path="/general/Uom" element={<Uom />} />
      <Route path="/general/ExchangeRate" element={<ExchangeRate />} />
      <Route path="/crm/leads/qualifications" element={<Qualifications />} />
      <Route path="/crm/leads/contact-type" element={<ContactType />} />
      <Route path="/crm/leads/sources" element={<SourcesView />} />
      <Route path="/crm/leads/status" element={<StatusView />} />
      <Route path="/crm/opportunities/states" element={<StatesView />} />
      <Route path="/crm/opportunities/lines" element={<LinesView />} />
      <Route path="/crm/opportunities/processes" element={<ProcessView />} />
      <Route
        path="/settings/profiles-settings"
        element={<ProfilesSettings />}
      />
      <Route path="/settings/config-settings" element={<ConfigSettings />} />
      <Route path="/accounting/account-plan" element={<AccountPlan />} />
      <Route path="/accounting/documents" element={<Documents />} />
      <Route path="/accounting/Series" element={<Series />} />
      <Route path="/accounting/CostCenters" element={<CostCenters />} />
      <Route path="/accounting/tax-aff-type" element={<TaxAffType />} />
      <Route path="/accounting/ConceptGroups" element={<ConceptGroups />} />
      <Route path="/accounting/Concepts" element={<Concepts />} />

      <Route path="/logistic/masters/Categories" element={<Categories />} />
      <Route path="/logistic/masters/Brands/" element={<Brands />} />
      <Route path="/logistic/masters/producttypes" element={<ProductTypes />} />
      <Route path="/logistic/masters/productlines" element={<ProductLines />} />
      <Route path="/logistic/masters/warehouses" element={<Warehouses />} />
      <Route
        path="/logistic/masters/movementtypes"
        element={<MovementTypes />}
      />
      <Route
        path="/logistic/operationwarehouses/products"
        element={<Products />}
      />
      <Route path="/operations/movements" element={<MovementsPage />} />

      <Route
        path="/Notifications/Notifications"
        element={<NotificationsPage />}
      />
      <Route path="/crm/parameters" element={<CommercialParameters />} />
      <Route path="/crm/accounts" element={<Accounts />} />
      <Route path="/crm/contacts" element={<Contacts />} />
      <Route path="/finance/bank/bank" element={<Bank />} />
      <Route path="/finance/boxes/boxes" element={<Boxes />} />
      <Route path="/finance/account/account" element={<Account />} />
      <Route path="/crm/tasks/tasks" element={<Tasks />} />
      <Route path="/crm/opportunity" element={<Opportunity />} />
      <Route
        path="/crm/opportunity/detail/:opporId"
        element={<DetailOpportunity />}
      />
      <Route path="/logistic/purchase-order" element={<PurchaseOrders />} />
      <Route
        path="/logistic/purchase-order/new"
        element={<PurchaseOrderDetail mode="create" />}
      />
      <Route
        path="/logistic/purchase-order/:id"
        element={<PurchaseOrderDetail mode="view" />}
      />
      <Route
        path="/logistic/purchase-order/:id/edit"
        element={<PurchaseOrderDetail mode="edit" />}
      />
      <Route path="/purchases/suppliers" element={<Suppliers />} />
      <Route path="/accounting/exerper" element={<ExerPer />} />
      <Route
        path="/presale/presaleproyects/presaleproyects"
        element={<PreSaleProyects />}
      />
      <Route
        path="/pre-sale/proyects/detail/:proyectId"
        element={<PreSaleProyectsDetail />}
      />
      <Route path="/crm/accounts/detail/:id" element={<ClientsDetailPage />} />

      <Route path="/presale/tasksprojects" element={<TasksProject />} />

      <Route path="/crm/viability" element={<Viability />} />
      <Route
        path="/pre-sale/proyects/tasks/:token"
        element={<ProjectTasksPage />}
      />
      <Route path="/pre-sale/quotation/quotes" element={<Quotes />} />
      <Route
        path="/pre-sale/quotation/detail/:quotationId"
        element={<DetailQuotes />}
      />
      <Route path="/crm/Hiring" element={<Hiring />} />
      <Route path="/operations/orders" element={<Orders />} />
      <Route path="/operations/attendance" element={<AttendanceMatrix />} />
      <Route
        path="/operations/SSOMA/DocumentType"
        element={<SsomaDocumentTypePage />}
      />
      <Route
        path="/operations/SSOMA/AssignmentType"
        element={<AssignmentTypePage />}
      />

      <Route
        path="/operations/SSOMA/PersonnelHomologation"
        element={<PersonnelHomologationPage />}
      />

      <Route
        path="/operations/SSOMA/Requirement"
        element={<RequirementPage />}
      />

      <Route path="/operations/SSOMA/Process" element={<ProcessPage />} />
      <Route path="/operations/support" element={<SupportPage />} />

      <Route path="*" element={<Construction />} />
    </Routes>
  );
}
