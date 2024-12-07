export const isURLValid = (str: string) =>
  /^(https?):\/\/(-\.)?([^\s/?\.#-]+\.?)+(\/[^\s]*)?$/i.test(str);
// Explanation:
// ^https?://        : Matches the protocol (http:// or https://)
// (-\.)?            : Matches the optional subdomain (e.g. www.)
// ([^\s/?\.#-]+\.?)+: Matches the domain (e.g. example.com or example.co.uk)
// (\/[^\s]*)?       : Matches the optional path (e.g. /path/to/page)
// $                 : Matches the end of the string
// i                 : Makes the pattern case-insensitive

export const isISO8601Valid = (str: string) =>
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/i.test(str);
// Explanation:
// ^\d{4}-\d{2}-\d{2}  : Matches the date part (YYYY-MM-DD)
// T                    : Matches the time separator
// \d{2}:\d{2}:\d{2}    : Matches the time part (HH:MM:SS)
// (\.\d+)?             : Matches the optional fractional seconds part (e.g. .123)
// (Z|[+-]\d{2}:\d{2})  : Matches the timezone part (Z or +HH:MM or -HH:MM)
// $                    : Matches the end of the string
// i                    : Makes the pattern case-insensitive
