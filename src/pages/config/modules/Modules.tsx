// pages/Modules.tsx
import { useCallback, useMemo, useState } from "react";
import { AsideModules } from "./components/aside/AsideModules";
import { AsideParentModules } from "./components/aside/AsideParentModules";
import type { TreeNode } from "./components/aside/tree";

// 👉 importa tu formulario (el que separamos)
import type { ModulesUpsertDto } from "@/application";
import { isFolder } from "./components/aside/tree/utils/nav";
import { ModulesForm } from "./components/form/ModulesForm";


const getParentModulesId = (p: any) =>
  p?.parentModulesId ?? p?.parentModulesId ?? p?.id ?? p?.modulesId ?? null;

export default function Modules() {

  const [mode, setMode] = useState<"create" | "edit">("create");
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
  const [editingDto, setEditingDto] = useState<ModulesUpsertDto | null>(null);
  const [selectedSection, setSelectedSection] = useState<any>(null);

  // Id usado para filtrar árbol en AsideModules
  const selectedId = useMemo(
    () => getParentModulesId(selectedSection),
    [selectedSection]
  );


  const [, setSelectedParent] = useState<TreeNode | null>(null);
  const [sectionTree, setSectionTree] = useState<TreeNode[] | undefined>(
    undefined
  );

  // Estado de guardado del formulario
  const [saving, setSaving] = useState(false);

  // 🔐 handler de submit del form
  async function handleSubmit(_dto: ModulesUpsertDto) {
    try {
      setSaving(true);
      alert("Módulo guardado correctamente ✅");
    } catch (err) {
      console.error(err);
      alert("Error guardando el módulo ❌");
    } finally {
      setSaving(false);
    }
  }

  const handleTreeLoaded = useCallback((roots: TreeNode[]) => {
    setSectionTree((prev) => {
      // evita setear si es la misma referencia o misma “firma”
      if (prev === roots) return prev;
      if (
        prev?.length === roots?.length &&
        prev?.every((n, i) => n.id === roots[i].id)
      )
        return prev;
      return roots;
    });
  }, []);

  const handleNodeSelect = useCallback((node: TreeNode) => {
    setSelectedNode((prev) => (prev?.id === node.id ? prev : node));
   
    if (isFolder(node)) {
      setMode("create");
      setEditingDto(null);
    } else {
      setMode("edit");
      setEditingDto({
        modulesId: node.id,
        parentModulesId: node.parentId ?? 0,
        parentId: node.parentId ?? 0,
        code: node.code,
        label: node.label,
        modulesDescription: "",
        icon: node.icon ?? "",
        path: node.path ?? "",
        orderNo: node.orderNo ?? 0,
      });
    }
  }, []);

  const currentParentMemo = useMemo(
    () =>
      isFolder(selectedNode)
        ? {
            id: selectedNode?.id as number,
            modulesId: selectedNode?.id ?? null,
          }
        : selectedId != null
        ? { id: Number(selectedId), modulesId: Number(selectedId) }
        : undefined,
    [selectedNode, selectedId]
  );

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gradient-to-b from-gray-50 to-white min-h-[100dvh]">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Gestión de Navegación
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Columna izquierda: sidebars */}
        <div className="space-y-5 md:col-span-1">
          {/* 🧭 Sidebar 1: Secciones principales */}
          <AsideParentModules
            selectedId={selectedId}
            onSelect={(row) => {
              setSelectedSection(row);
              setSelectedParent(null);
              setSectionTree(undefined); 
            }}
          />

          {/* 🌳 Sidebar 2: Árbol de módulos dentro de la sección seleccionada */}
          <AsideModules
            sectionId={selectedId} // parentModulesId
            onSelectParent={(parentId) => {
              // Si AsideModules te devuelve un parentId, aquí puedes setear selectedParent
              // o dejar que el form lo seleccione manualmente.
              console.log("Padre seleccionado:", parentId);
            }}
          
            onTreeLoaded={handleTreeLoaded}
            onNodeSelect={handleNodeSelect}
          />
        </div>

        {/* Columna derecha: formulario */}
        <div className="md:col-span-2">
          <div className="rounded-2xl border bg-white p-4 md:p-6">
            {!selectedSection ? (
              <p className="text-sm text-gray-500">
                Selecciona una <b>sección</b> en la izquierda para crear/editar
                un módulo.
              </p>
            ) : (
              <ModulesForm
                defaultValues={
                  mode === "edit" && editingDto
                    ? editingDto
                    : {
                        modulesId: undefined,
                        parentModulesId:
                          (isFolder(selectedNode)
                            ? selectedNode?.id
                            : Number(selectedId ?? 0)) || 0,
                        parentId:
                          (isFolder(selectedNode)
                            ? selectedNode?.id
                            : Number(selectedId ?? 0)) || 0,
                        code: "",
                        label: "", 
                        modulesDescription: "",
                        icon: "",
                        path: "",
                        orderNo: 0,
                      }
                }
                sectionTitle={
                  selectedSection?.title ??
                  selectedSection?.label ??
                  `Sección ${selectedId ?? ""}`
                }
                tree={sectionTree}
                currentParent={currentParentMemo}
                saving={saving}
                onSubmit={handleSubmit}
                showActions
                autofocus
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
