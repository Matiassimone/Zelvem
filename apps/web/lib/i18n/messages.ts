/**
 * UI strings for both locales. Spanish is the product's primary voice;
 * translations are free (tone-first), never literal — see CLAUDE.md i18n.
 */
export const messages = {
  es: {
    common: {
      appName: 'Zelvem',
      tagline: 'Tu sistema de control personal.',
    },
    nav: {
      home: 'Inicio',
      inbox: 'Email',
      calendar: 'Calendario',
      todos: 'Tareas',
      blog: 'Blog',
      social: 'Social',
      finance: 'Finanzas',
      account: 'Tu cuenta',
      themeToggle: 'Cambiar tema',
    },
    login: {
      title: 'Volvé a tu centro de control',
      email: 'Email',
      password: 'Contraseña',
      submit: 'Entrar',
      invalidCredentials: 'Revisá tu email y contraseña.',
      genericError: 'No pudimos conectarte. Probá de nuevo.',
    },
    placeholder: {
      comingSoon: 'Este módulo se construye en su propia sesión.',
    },
  },
  en: {
    common: {
      appName: 'Zelvem',
      tagline: 'Your personal control system.',
    },
    nav: {
      home: 'Home',
      inbox: 'Email',
      calendar: 'Calendar',
      todos: 'Todos',
      blog: 'Blog',
      social: 'Social',
      finance: 'Finance',
      account: 'Your account',
      themeToggle: 'Switch theme',
    },
    login: {
      title: 'Back to your control center',
      email: 'Email',
      password: 'Password',
      submit: 'Sign in',
      invalidCredentials: 'Check your email and password.',
      genericError: "We couldn't sign you in. Try again.",
    },
    placeholder: {
      comingSoon: 'This module gets built in its own session.',
    },
  },
} as const

export type Locale = keyof typeof messages

/** Widens literal strings so every locale conforms to the same shape. */
type DeepStrings<T> = { [K in keyof T]: T[K] extends string ? string : DeepStrings<T[K]> }
export type Messages = DeepStrings<(typeof messages)['es']>
