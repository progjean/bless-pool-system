import { Language } from '../context/LanguageContext';

/**
 * Formata valor monetário baseado no idioma
 * PT-BR: R$ 1.234,56
 * EN-US: $1,234.56
 */
export function formatCurrency(value: number, language: Language = 'en-US'): string {
  if (language === 'pt-BR') {
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  } else {
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
}

/**
 * Converte temperatura de Celsius para Fahrenheit
 */
export function celsiusToFahrenheit(celsius: number): number {
  return Math.round((celsius * 9/5) + 32);
}

/**
 * Formata temperatura baseado no idioma
 * PT-BR: 26 °C
 * EN-US: 79 °F
 */
export function formatTemperature(celsius: number, language: Language = 'en-US'): string {
  if (language === 'pt-BR') {
    return `${celsius} °C`;
  } else {
    const fahrenheit = celsiusToFahrenheit(celsius);
    return `${fahrenheit} °F`;
  }
}

/**
 * Formata faixa de temperatura baseado no idioma
 * PT-BR: 24 - 28 °C
 * EN-US: 75 - 82 °F
 */
export function formatTemperatureRange(minCelsius: number, maxCelsius: number, language: Language = 'en-US'): string {
  if (language === 'pt-BR') {
    return `${minCelsius} - ${maxCelsius} °C`;
  } else {
    const minF = celsiusToFahrenheit(minCelsius);
    const maxF = celsiusToFahrenheit(maxCelsius);
    return `${minF} - ${maxF} °F`;
  }
}

/**
 * Formata número com separadores apropriados
 * PT-BR: 1.234,56
 * EN-US: 1,234.56
 */
export function formatNumber(value: number, decimals: number = 2, language: Language = 'en-US'): string {
  if (language === 'pt-BR') {
    return value.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  } else {
    return value.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  }
}

