import { formatDateShort } from "@/lib/utils";
import { EMAIL_CONFIG, HELP_CONFIG } from "@/constants/constants";
import { HelpRequestData } from "@/schemas/help";

import es from "@/locales/es.json";
import en from "@/locales/en.json";

type Locale = "es" | "en";
const translations = { es, en };

function t(key: string, locale: string = "es"): string {
  const lang = (locale === "en" ? "en" : "es") as Locale;
  const keys = key.split(".");
  let value: any = translations[lang];

  for (const k of keys) {
    if (value && typeof value === "object" && k in value) {
      value = value[k];
    } else {
      return key;
    }
  }

  return typeof value === "string" ? value : key;
}

// ==================== DESIGN SYSTEM (Reused from main templates) ====================
const DESIGN = {
  colors: {
    primary: "#679436",
    white: "#FFFFFF",
    gray50: "#FAFAFA",
    gray100: "#F5F5F5",
    gray200: "#EEEEEE",
    gray500: "#9E9E9E",
    gray700: "#616161",
    gray800: "#424242",
  },
  fonts: {
    family:
      "'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, 'Helvetica Neue', Arial, sans-serif",
    sizes: {
      xs: "11px",
      sm: "12px",
      base: "14px",
      md: "15px",
      lg: "16px",
      xl: "18px",
    },
    weights: {
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
    },
  },
};

// ==================== SUPPORT REQUEST EMAIL DATA ====================
export interface SupportRequestEmailData extends HelpRequestData {
  userName: string;
  userEmail: string;
  userRole?: string;
  locale?: string;
  submittedAt: Date;
}

// ==================== SUPPORT REQUEST HTML TEMPLATE ====================
export function generateSupportRequestEmailHTML(
  data: SupportRequestEmailData,
): string {
  const locale = data.locale || "es";
  const categoryLabel = t(`help.categories.${data.category}`, locale);
  const images = data.images || [];

  // Build images section
  let imagesSection = "";
  if (images.length > 0) {
    const imageItems = images
      .map(
        (img) => `
        <tr>
          <td style="padding: 8px 0;">
            <a href="${img.cloudinaryUrl}" target="_blank" style="color: #1976D2; text-decoration: none;">
              <img src="${img.cloudinaryUrl}" alt="${img.nombre}" style="max-width: 200px; max-height: 150px; border-radius: 4px; border: 1px solid ${DESIGN.colors.gray200}; display: block; margin-bottom: 4px;" />
              <span style="font-family: ${DESIGN.fonts.family}; font-size: ${DESIGN.fonts.sizes.xs}; color: ${DESIGN.colors.gray700};">${img.nombre}</span>
            </a>
          </td>
        </tr>
      `,
      )
      .join("");

    imagesSection = `
      <tr>
        <td style="padding: 20px 0 8px 0;">
          <h3 style="margin: 0; font-family: ${DESIGN.fonts.family}; font-size: ${DESIGN.fonts.sizes.md}; font-weight: ${DESIGN.fonts.weights.semibold}; color: ${DESIGN.colors.gray800};">
            ${t("help.form.images", locale)}
          </h3>
        </td>
      </tr>
      ${imageItems}
    `;
  }

  return `<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${t("help.title", locale)} - ${data.subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${DESIGN.colors.gray100}; font-family: ${DESIGN.fonts.family};">
  
  <!-- Main wrapper -->
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; background-color: ${DESIGN.colors.gray100};">
    <tr>
      <td align="center" style="padding: 24px 16px;">
        
        <!-- Main container -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="680" style="width: 680px; max-width: 100%; margin: 0 auto; background-color: ${DESIGN.colors.white}; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <tr>
            <td align="center" style="background-color: ${DESIGN.colors.primary}; padding: 28px 24px; border-radius: 12px 12px 0 0;">
              <img src="${EMAIL_CONFIG.companyLogo}" alt="Combilift" width="160" style="max-width: 160px; height: auto; display: block; margin-bottom: 12px;">
              <h1 style="margin: 0; font-family: ${DESIGN.fonts.family}; font-size: ${DESIGN.fonts.sizes.xl}; font-weight: ${DESIGN.fonts.weights.semibold}; color: ${DESIGN.colors.gray800};">
                ${t("help.title", locale).toUpperCase()}
              </h1>
            </td>
          </tr>

          <!-- Category Badge -->
          <tr>
            <td style="padding: 16px 24px; background-color: ${DESIGN.colors.gray50}; border-bottom: 1px solid ${DESIGN.colors.gray200};">
              <span style="display: inline-block; padding: 6px 14px; background-color: #E3F2FD; border-radius: 6px; border-left: 4px solid #1976D2; font-family: ${DESIGN.fonts.family}; font-size: ${DESIGN.fonts.sizes.xs}; font-weight: ${DESIGN.fonts.weights.medium}; color: #1565C0; text-transform: uppercase; letter-spacing: 0.5px;">
                ${categoryLabel}
              </span>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 24px;">
              
              <!-- User Info -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 20px;">
                <tr>
                  <td style="padding: 12px; background-color: ${DESIGN.colors.gray50}; border-radius: 6px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td style="font-family: ${DESIGN.fonts.family}; font-size: ${DESIGN.fonts.sizes.sm}; color: ${DESIGN.colors.gray700};">
                          <strong>${t("common.user", locale)}:</strong> ${data.userName}
                        </td>
                      </tr>
                      <tr>
                        <td style="font-family: ${DESIGN.fonts.family}; font-size: ${DESIGN.fonts.sizes.sm}; color: ${DESIGN.colors.gray700}; padding-top: 4px;">
                          <strong>${t("common.email", locale)}:</strong> <a href="mailto:${data.userEmail}" style="color: #1976D2; text-decoration: none;">${data.userEmail}</a>
                        </td>
                      </tr>
                      ${
                        data.userRole
                          ? `
                      <tr>
                        <td style="font-family: ${DESIGN.fonts.family}; font-size: ${DESIGN.fonts.sizes.sm}; color: ${DESIGN.colors.gray700}; padding-top: 4px;">
                          <strong>${t("common.role", locale)}:</strong> ${data.userRole}
                        </td>
                      </tr>
                      `
                          : ""
                      }
                      <tr>
                        <td style="font-family: ${DESIGN.fonts.family}; font-size: ${DESIGN.fonts.sizes.sm}; color: ${DESIGN.colors.gray700}; padding-top: 4px;">
                          <strong>${t("common.date", locale)}:</strong> ${formatDateShort(data.submittedAt, locale)}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Subject -->
              <h2 style="margin: 0 0 12px 0; font-family: ${DESIGN.fonts.family}; font-size: ${DESIGN.fonts.sizes.lg}; font-weight: ${DESIGN.fonts.weights.semibold}; color: ${DESIGN.colors.gray800};">
                ${data.subject}
              </h2>

              <!-- Description -->
              <div style="font-family: ${DESIGN.fonts.family}; font-size: ${DESIGN.fonts.sizes.base}; color: ${DESIGN.colors.gray800}; line-height: 1.6; white-space: pre-wrap; margin-bottom: 20px;">
                ${data.description}
              </div>

              <!-- Images -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                ${imagesSection}
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="background-color: ${DESIGN.colors.gray100}; padding: 20px 24px; border-top: 1px solid ${DESIGN.colors.gray200}; border-radius: 0 0 12px 12px;">
              <p style="margin: 0 0 4px 0; font-family: ${DESIGN.fonts.family}; font-size: ${DESIGN.fonts.sizes.xs}; color: ${DESIGN.colors.gray500};">
                ${t("email.common.automaticMessage", locale)} <strong style="color: ${DESIGN.colors.gray700};">CombiSales</strong>
              </p>
              <p style="margin: 0; font-family: ${DESIGN.fonts.family}; font-size: 10px; color: #9E9E9E;">
                © ${new Date().getFullYear()} Combilift. ${t("email.common.allRightsReserved", locale)}
              </p>
            </td>
          </tr>

        </table>
        
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ==================== SUPPORT REQUEST TEXT TEMPLATE ====================
export function generateSupportRequestEmailText(
  data: SupportRequestEmailData,
): string {
  const locale = data.locale || "es";
  const categoryLabel = t(`help.categories.${data.category}`, locale);
  const images = data.images || [];

  let imagesText = "";
  if (images.length > 0) {
    imagesText = `
${"─".repeat(55)}
${t("help.form.images", locale).toUpperCase()}
${"─".repeat(55)}

${images.map((img, i) => `${i + 1}. ${img.nombre}\n   ${img.cloudinaryUrl}`).join("\n\n")}
`;
  }

  return `
${"═".repeat(55)}
${t("help.title", locale).toUpperCase()}
${"═".repeat(55)}

${t("help.form.category", locale)}: ${categoryLabel}

${t("common.user", locale)}:  ${data.userName}
${t("common.email", locale)}: ${data.userEmail}
${data.userRole ? `${t("common.role", locale)}:  ${data.userRole}` : ""}
${t("common.date", locale)}:  ${formatDateShort(data.submittedAt, locale)}

${"─".repeat(55)}
${t("help.form.subject", locale).toUpperCase()}
${"─".repeat(55)}

${data.subject}

${"─".repeat(55)}
${t("help.form.description", locale).toUpperCase()}
${"─".repeat(55)}

${data.description}
${imagesText}

${"═".repeat(55)}
${t("email.common.automaticMessage", locale)} CombiSales
© ${new Date().getFullYear()} Combilift
${"═".repeat(55)}
`.trim();
}
