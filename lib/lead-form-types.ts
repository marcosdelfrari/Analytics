export const LEAD_FORM_KINDS = [
  "whatsapp_button",
  "popup",
  "exit_intent",
] as const;

export type LeadFormKind = (typeof LEAD_FORM_KINDS)[number];

export const LEAD_FORM_THEME_MODES = ["dark", "light"] as const;

export type LeadFormThemeMode = (typeof LEAD_FORM_THEME_MODES)[number];

export const LEAD_FIELD_TYPES = [
  "text",
  "email",
  "phone",
  "textarea",
  "select",
  "checkbox",
  "number",
] as const;

export type LeadFieldType = (typeof LEAD_FIELD_TYPES)[number];

export type LeadFormFieldDef = {
  id: string;
  label: string;
  type: LeadFieldType;
  required: boolean;
  placeholder?: string;
  options?: string[];
};

export type LeadFormDraft = {
  id?: string;
  organizationId: string;
  companyId: string | null;
  name: string;
  kind: LeadFormKind;
  title: string;
  subtitle: string;
  ctaLabel: string;
  whatsappNumber: string;
  whatsappMessage: string;
  fields: LeadFormFieldDef[];
  sendConfirmationEmail: boolean;
  confirmationEmailSubject: string;
  confirmationEmailBody: string;
  active: boolean;
  /** URL pública do logo no cabeçalho do modal */
  brandLogoUrl: string;
  /** Cor de destaque (hex). Vazio = padrão do tipo de formulário */
  brandAccentColor: string;
  /** Imagem de capa opcional acima do título */
  brandHeaderImageUrl: string;
  /** Aparência do modal no site: escuro (preto) ou claro (branco) */
  brandTheme: LeadFormThemeMode;
};

export type LeadFormRecord = LeadFormDraft & {
  id: string;
  companyName: string | null;
  createdAt: string;
  updatedAt: string;
};

export const LEAD_FORM_KIND_LABELS: Record<LeadFormKind, string> = {
  whatsapp_button: "Botão WhatsApp",
  popup: "Popup",
  exit_intent: "Sair (exit intent)",
};

export const LEAD_FIELD_TYPE_LABELS: Record<LeadFieldType, string> = {
  text: "Texto",
  email: "E-mail",
  phone: "Telefone",
  textarea: "Texto longo",
  select: "Seleção",
  checkbox: "Checkbox",
  number: "Número",
};

export function defaultLeadFormDraft(
  organizationId: string,
  companyId: string | null = null,
): LeadFormDraft {
  return {
    organizationId,
    companyId,
    name: "Novo formulário",
    kind: "popup",
    title: "Fale conosco",
    subtitle: "Deixe seus dados e retornamos em breve.",
    ctaLabel: "Enviar",
    whatsappNumber: "",
    whatsappMessage: "Olá! Vim pelo site e gostaria de mais informações.",
    fields: [
      {
        id: "nome",
        label: "Nome",
        type: "text",
        required: true,
        placeholder: "Seu nome",
      },
      {
        id: "email",
        label: "E-mail",
        type: "email",
        required: true,
        placeholder: "voce@empresa.com",
      },
      {
        id: "telefone",
        label: "WhatsApp",
        type: "phone",
        required: false,
        placeholder: "(11) 99999-9999",
      },
    ],
    sendConfirmationEmail: false,
    confirmationEmailSubject: "Recebemos seu contato",
    confirmationEmailBody:
      "Olá! Obrigado pelo interesse. Em breve entraremos em contato.",
    active: true,
    brandLogoUrl: "",
    brandAccentColor: "",
    brandHeaderImageUrl: "",
    brandTheme: "dark",
  };
}

export function isLeadFormThemeMode(value: string): value is LeadFormThemeMode {
  return (LEAD_FORM_THEME_MODES as readonly string[]).includes(value);
}

export function isLeadFormKind(value: string): value is LeadFormKind {
  return (LEAD_FORM_KINDS as readonly string[]).includes(value);
}

export function isLeadFieldType(value: string): value is LeadFieldType {
  return (LEAD_FIELD_TYPES as readonly string[]).includes(value);
}
