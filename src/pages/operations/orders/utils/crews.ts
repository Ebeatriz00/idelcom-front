export const crews = [
  {
    id: 1,
    name: "Cuadrilla A",
    leader: "Carlos Pérez",
    workerShit: "Mañana",
    membersCount: 6,
    progress: 35,
    color: "violet" as const,
    ots: [
      { code: "OT-001", name: "Cableado de puesto 1", quantity: 2 },
      { code: "OT-002", name: "Pruebasdos y tendido", quantity: 2 },
    ],
  },
  {
    id: 2,
    name: "Cuadrilla B",
    leader: "Luis Gómez",
    workerShit: "Noche",
    membersCount: 8,
    progress: 10,
    color: "blue" as const,
    ots: [
      { code: "OT-003", name: "Cableado de puesto 2", quantity: 3 },
      { code: "OT-004", name: "Canalización y tendido", quantity: 3 },
    ],
  },
];