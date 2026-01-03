// Shared Constants
export const ORDER_STATUS = {
  RECEPCION: 'Recepción',
  DIAGNOSTICO: 'Diagnóstico',
  APROBACION: 'Pendiente Aprobación',
  REPARACION: 'En Reparación',
  LISTO: 'Listo',
  PAGADO: 'Pagado',
  CANCELADO: 'Cancelado'
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-DO', {
    style: 'currency',
    currency: 'DOP',
  }).format(amount);
};
