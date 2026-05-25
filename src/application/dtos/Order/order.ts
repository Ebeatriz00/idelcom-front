export type OrderStatus = 'pendiente' | 'en_proceso' | 'completado' | 'rechazado'


export interface Order {
id: string
cliente: string
estado: OrderStatus
avance: number // 0..100
fecha: string // ISO date
}