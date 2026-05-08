export type FbAuthResponse = {
  code: string;
  accessToken?: string;
  userID?: string;
  expiresIn?: number;
  signedRequest?: string;
  graphDomain?: string;
  data_access_expiration_time?: number;
};

export type FbLoginResponse = {
  status: "connected" | "not_authorized" | "unknown";
  authResponse: FbAuthResponse | null;
};

export type FbLoginOptions = {
  config_id: string;
  response_type: "code";
  override_default_response_type: boolean;
  scope?: string;
  extras?: {
    setup?: Record<string, unknown>;
    featureType?: string;
    sessionInfoVersion?: string;
  };
};

export type MetaSignupPayload = {
  code: string;
  wabaId?: string;
  phoneNumberId?: string;
};

export type MetaExchangeCodeData = {
  facebookBusinessId: string;
  wabaId: string;
  whatsappPhoneNumberId: string;
  phoneNumber: string;
};

export type MetaExchangeCodeResult = {
  success: boolean;
  message: string;
  data: MetaExchangeCodeData;
};

export type MetaSubscribeResult = {
  success: boolean;
  message: string;
  data: { success: boolean };
};

declare global {
  interface Window {
    FB: {
      init: (options: {
        appId: string;
        version: string;
        xfbml?: boolean;
        cookie?: boolean;
      }) => void;
      login: (callback: (response: FbLoginResponse) => void, options?: FbLoginOptions) => void;
      logout: (callback: (response: unknown) => void) => void;
    };
    fbAsyncInit?: () => void;
  }
}
