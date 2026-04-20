/** Standard success envelope from the API (`success: true`). */
export type ApiSuccessEnvelope<TData> = {
  success: true;
  message: string;
  data: TData;
  requestId?: string;
};
