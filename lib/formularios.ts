/** Estado que devuelven las Server Actions de formularios: un mensaje de error o de éxito. */
export type EstadoFormulario = { error?: string; ok?: string; extra?: string } | null;
