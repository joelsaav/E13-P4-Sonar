declare global {
  interface Window {
    google?: typeof google;
  }
  namespace google {
    namespace accounts {
      namespace id {
        interface CredentialResponse {
          clientId: string;
          credential: string;
          select_by: string;
        }
        interface IdConfiguration {
          client_id: string;
          callback: (response: CredentialResponse) => void;
          auto_select?: boolean;
          ux_mode?: "popup" | "redirect";
          use_fedcm_for_prompt?: boolean;
          nonce?: string;
          context?: "signin" | "signup" | "use";
        }
        function initialize(config: IdConfiguration): void;
        function prompt(momentListener?: () => void): void;
        function renderButton(
          parent: HTMLElement,
          options: Record<string, unknown>,
        ): void;
      }
    }
  }
}

export {};
